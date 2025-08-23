// src/UnbrokenPath.js
import React, { useEffect, useRef, useState } from 'react';
import { auth, db, storage } from './firebase';
import MilestoneDashboard from './MilestoneSystem';

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';

import {
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// ---------- helpers ----------
async function createUserProfile(uid, email) {
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    await setDoc(userRef, {
      email,
      trustScore: 25,
      avatar_likeness_url: `https://placehold.co/400x400/1a202c/ffffff?text=${email.charAt(0).toUpperCase()}`,
      original_photo_url: '',
      current_reveal_percent: 0,
      sobrietyDate: null,
      createdAt: serverTimestamp(),
      lastActive: serverTimestamp(),
    });
  } else {
    await updateDoc(userRef, { lastActive: serverTimestamp() });
  }
}

function Spinner() {
  return (
    <div className="flex justify-center items-center p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
    </div>
  );
}

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md relative border border-gray-700">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">✕</button>
        {children}
      </div>
    </div>
  );
}

function CrisisButton() {
  const [open, setOpen] = useState(false);
  const resources = [
    { name: '988 Suicide & Crisis Lifeline', number: '988', hours: '24/7' },
    { name: 'Crisis Text Line', number: 'Text HOME to 741741', hours: '24/7' },
    { name: 'SAMHSA National Helpline', number: '1-800-662-4357', hours: '24/7' },
    { name: 'Domestic Violence Hotline', number: '1-800-799-7233', hours: '24/7' },
  ];
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 right-4 z-40 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full shadow-lg"
      >
        🆘 Crisis Help
      </button>
      {open && (
        <Modal onClose={() => setOpen(false)}>
          <h2 className="text-2xl font-bold text-red-400 mb-4 text-center">Crisis Resources</h2>
          <div className="space-y-3">
            {resources.map((r) => (
              <div key={r.name} className="bg-gray-700 p-4 rounded-lg">
                <div className="font-semibold text-white">{r.name}</div>
                <div className="text-blue-300 font-bold">{r.number}</div>
                <div className="text-gray-400 text-sm">{r.hours}</div>
              </div>
            ))}
          </div>
          <p className="text-gray-400 text-sm mt-6 text-center">
            If you’re in immediate danger, call 911.
          </p>
        </Modal>
      )}
    </>
  );
}

// ---------- auth ----------
function Auth({ setLoading }) {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [signup, setSignup] = useState(true);
  const [err, setErr] = useState('');

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setErr('');
    try {
      const fn = signup ? createUserWithEmailAndPassword : signInWithEmailAndPassword;
      const cred = await fn(auth, email, pw);
      await createUserProfile(cred.user.uid, cred.user.email || email);
    } catch (e2) {
      setErr(e2.message || 'Auth error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center p-4">
      <CrisisButton />
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-2xl border border-gray-700">
        <h1 className="text-3xl font-bold text-center mb-6">Unbroken Path</h1>
        {err && <p className="bg-red-500/20 text-red-300 p-3 rounded-lg mb-4 text-center">{err}</p>}
        <form onSubmit={submit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            required
          />
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg">
            {signup ? 'Sign Up' : 'Log In'}
          </button>
        </form>
        <button className="w-full mt-4 text-gray-400 hover:text-white" onClick={() => setSignup(!signup)}>
          {signup ? 'Already have an account? Log In' : 'Need an account? Sign Up'}
        </button>
      </div>
    </div>
  );
}

// ---------- dashboard ----------
function Dashboard({ user, userData, setError, setLoading, setView }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  function onPick(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) return setError('Please select an image file.');
    if (f.size > 5 * 1024 * 1024) return setError('Max file size is 5MB.');
    setError('');
    setFile(f);
  }

  async function upload() {
    if (!file || !user) return;
    setUploading(true);
    setError('');
    try {
      const path = `user_photos/${user.uid}/${Date.now()}_${file.name}`;
      const snap = await uploadBytes(ref(storage, path), file, { contentType: file.type });
      const url = await getDownloadURL(snap.ref);
      await updateDoc(doc(db, 'users', user.uid), {
        original_photo_url: url,
        avatar_likeness_url: userData?.avatar_likeness_url || url,
        photoUpdatedAt: serverTimestamp(),
      });
      await addDoc(collection(db, 'consent_log'), {
        userId: user.uid,
        action: 'photo_upload',
        filename: file.name,
        fileSize: file.size,
        timestamp: serverTimestamp(),
      });
    } catch (e) {
      setError('Upload failed.');
    } finally {
      setUploading(false);
      setFile(null);
    }
  }

  return (
    <div className="p-4 md:p-8 text-white">
      <CrisisButton />
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Your Dashboard</h2>
        <div className="space-x-4">
          <button onClick={() => setView('meeting')} className="bg-green-600 hover:bg-green-700 py-2 px-6 rounded-lg">
            Join Meeting
          </button>
          <button onClick={() => signOut(auth)} className="bg-gray-600 hover:bg-gray-700 py-2 px-4 rounded-lg">
            Sign Out
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <MilestoneDashboard user={user} userData={userData} setError={setError} />
        </div>

        <div className="lg:col-span-1 bg-gray-800 p-6 rounded-2xl border border-gray-700">
          <h3 className="text-xl font-bold mb-4">Your Identity Shield</h3>
          <img
            src={userData?.avatar_likeness_url || 'https://placehold.co/256x256'}
            alt="Avatar"
            className="w-48 h-48 rounded-full mx-auto mb-4 border-4 border-gray-700"
          />
          <p className="text-center text-gray-400 mb-4">{userData?.email || user?.email}</p>
          <input
            type="file"
            accept="image/*"
            onChange={onPick}
            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-blue-500/10 file:text-blue-300"
          />
          <button
            onClick={upload}
            disabled={!file || uploading}
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-600"
          >
            {uploading ? <Spinner /> : 'Upload & Generate Avatar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- meeting (lightweight) ----------
function MeetingTile({ participant }) {
  const { avatar_likeness_url, email } = participant;
  const [talking] = useState(false); // simple placeholder UI state
  return (
    <div className={`relative aspect-square bg-gray-700 rounded-2xl overflow-hidden border-4 ${talking ? 'border-green-400' : 'border-gray-600'}`}>
      <img src={avatar_likeness_url || 'https://placehold.co/600x600'} alt={email} className="w-full h-full object-cover" />
      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-xs truncate">{email}</div>
    </div>
  );
}

function MeetingView({ user, setView }) {
  const participants = [
    { email: user?.email || 'you@example.com', avatar_likeness_url: 'https://placehold.co/300x300' },
  ];
  return (
    <div className="p-4 md:p-8 text-white">
      <button onClick={() => setView('dashboard')} className="mb-4 bg-gray-700 hover:bg-gray-600 py-2 px-4 rounded-lg">
        ← Back to Dashboard
      </button>
      <h2 className="text-2xl font-bold mb-4">Meeting</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {participants.map((p) => <MeetingTile key={p.email} participant={p} />)}
      </div>
    </div>
  );
}

// ---------- root component ----------
export default function UnbrokenPathApp() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [view, setView] = useState('dashboard'); // 'dashboard' | 'meeting'
  const [error, setError] = useState('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const refUser = doc(db, 'users', u.uid);
        const snap = await getDoc(refUser);
        if (snap.exists()) setUserData({ uid: u.uid, email: u.email, ...snap.data() });
        else setUserData({ uid: u.uid, email: u.email });
      } else {
        setUserData(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center"><Spinner /></div>;
  if (!user) return <Auth setLoading={setLoading} />;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {error && <div className="bg-red-600 text-white p-3 text-center">{error}</div>}
      {view === 'dashboard'
        ? <Dashboard user={user} userData={userData} setError={setError} setLoading={setLoading} setView={setView} />
        : <MeetingView user={user} setView={setView} />}
    </div>
  );
    }
