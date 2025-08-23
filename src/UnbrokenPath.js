// src/UnbrokenPath.js
import React, { useEffect, useState } from 'react';
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
  onSnapshot,
  updateDoc,
  collection,
  addDoc,
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
      avatar_likeness_url: '',
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
    <div style={{ padding: 16, display: 'flex', justifyContent: 'center' }}>
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          border: '3px solid #3B82F6',
          borderTopColor: 'transparent',
          animation: 'spin 1s linear infinite',
        }}
      />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function Modal({ children, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,.6)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#1f2937',
          color: '#fff',
          borderRadius: 16,
          padding: 24,
          maxWidth: 480,
          width: '100%',
          border: '1px solid #374151',
        }}
      >
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
    { name: 'National Domestic Violence Hotline', number: '1-800-799-7233', hours: '24/7' },
  ];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          top: 12,
          right: 12,
          zIndex: 60,
          background: '#dc2626',
          color: '#fff',
          fontWeight: 700,
          borderRadius: 999,
          padding: '8px 14px',
          border: 'none',
        }}
      >
        🆘 Crisis Help
      </button>

      {open && (
        <Modal onClose={() => setOpen(false)}>
          <h2 style={{ marginTop: 0, marginBottom: 8, fontSize: 20, color: '#fca5a5', textAlign: 'center' }}>
            Crisis Resources
          </h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {resources.map((r) => (
              <li key={r.name} style={{ margin: '10px 0', background: '#111827', padding: 12, borderRadius: 10 }}>
                <div style={{ fontWeight: 700 }}>{r.name}</div>
                <div style={{ marginTop: 4 }}>{r.number}</div>
                <div style={{ marginTop: 2, fontSize: 12, color: '#9ca3af' }}>{r.hours}</div>
              </li>
            ))}
          </ul>
          <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 12, textAlign: 'center' }}>
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
    <div
      style={{
        minHeight: '100vh',
        background: '#111827',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <CrisisButton />
      <form
        onSubmit={submit}
        style={{
          width: '100%',
          maxWidth: 420,
          background: '#1f2937',
          borderRadius: 16,
          padding: 24,
          border: '1px solid #374151',
        }}
      >
        <h1 style={{ marginTop: 0, textAlign: 'center' }}>Unbroken Path</h1>
        {err && (
          <div
            style={{
              background: '#7f1d1d',
              color: '#fecaca',
              padding: 10,
              borderRadius: 8,
              marginBottom: 12,
            }}
          >
            {err}
          </div>
        )}
        <label>Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: '100%',
            margin: '6px 0 12px',
            padding: 10,
            borderRadius: 8,
            border: '1px solid #374151',
            background: '#111827',
            color: '#fff',
          }}
        />
        <label>Password</label>
        <input
          type="password"
          required
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          style={{
            width: '100%',
            margin: '6px 0 16px',
            padding: 10,
            borderRadius: 8,
            border: '1px solid #374151',
            background: '#111827',
            color: '#fff',
          }}
        />
        <button
          type="submit"
          style={{
            width: '100%',
            padding: 12,
            borderRadius: 10,
            border: 'none',
            fontWeight: 700,
            background: '#2563eb',
            color: '#fff',
          }}
        >
          {signup ? 'Sign Up' : 'Log In'}
        </button>
        <button
          type="button"
          onClick={() => setSignup((v) => !v)}
          style={{
            marginTop: 10,
            width: '100%',
            padding: 10,
            borderRadius: 10,
            border: '1px solid #374151',
            background: 'transparent',
            color: '#cbd5e1',
          }}
        >
          {signup ? 'Already have an account? Log In' : 'Need an account? Sign Up'}
        </button>
      </form>
    </div>
  );
}

// ---------- dashboard ----------
function Dashboard({ user, userData, setError }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  function onPick(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError('Max file size is 5MB.');
      return;
    }
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
        // leave avatar empty unless you set it elsewhere on purpose
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
    <div style={{ padding: 16, color: '#fff' }}>
      <CrisisButton />
      <div
        style={{
          display: 'grid',
          gap: 16,
          gridTemplateColumns: '1fr 1fr',
          alignItems: 'start',
        }}
      >
        <div style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 16, padding: 16 }}>
          <h3 style={{ marginTop: 0 }}>Your Identity</h3>

          {/* Only render image if you actually have a URL */}
          {userData?.avatar_likeness_url ? (
            <img
              alt="Avatar"
              src={userData.avatar_likeness_url}
              style={{
                width: 160,
                height: 160,
                borderRadius: '50%',
                display: 'block',
                margin: '0 auto 12px',
                objectFit: 'cover',
                border: '4px solid #374151',
              }}
            />
          ) : (
            <div
              style={{
                width: 160,
                height: 160,
                borderRadius: '50%',
                display: 'block',
                margin: '0 auto 12px',
                border: '2px dashed #374151',
                color: '#9ca3af',
                alignItems: 'center',
                justifyContent: 'center',
                display: 'flex',
                fontSize: 12,
              }}
            >
              No avatar yet
            </div>
          )}

          <p style={{ textAlign: 'center', color: '#cbd5e1' }}>{userData?.email || user?.email}</p>
          <p style={{ textAlign: 'center', color: '#94a3b8' }}>
            User ID: <code>{user.uid}</code>
          </p>

          <input type="file" accept="image/*" onChange={onPick} />
          <button
            onClick={upload}
            disabled={!file || uploading}
            style={{
              marginTop: 12,
              width: '100%',
              padding: 10,
              borderRadius: 8,
              border: 'none',
              fontWeight: 700,
              background: uploading ? '#6b7280' : '#2563eb',
              color: '#fff',
              cursor: uploading ? 'not-allowed' : 'pointer',
            }}
          >
            {uploading ? 'Uploading…' : 'Upload Photo'}
          </button>
        </div>

        <div style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 16, padding: 16 }}>
          <MilestoneDashboard user={user} userData={userData} setError={setError} />
        </div>
      </div>

      <div style={{ marginTop: 20, textAlign: 'right' }}>
        <button
          onClick={() => signOut(auth)}
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            border: 'none',
            background: '#4b5563',
            color: '#fff',
            fontWeight: 700,
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

// ---------- root ----------
export default function UnbrokenPathApp() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (!u) {
        setUserData(null);
        setLoading(false);
        return;
      }
      const userRef = doc(db, 'users', u.uid);
      const stop = onSnapshot(userRef, (snap) => {
        setUserData(snap.data() || { email: u.email });
        setLoading(false);
      });
      return () => stop();
    });
    return () => unsub();
  }, []);

  if (loading) return <Spinner />;
  if (!user) return <Auth setLoading={setLoading} />;

  return (
    <div style={{ minHeight: '100vh', background: '#111827', color: '#fff' }}>
      {error && (
        <div
          style={{
            background: '#7f1d1d',
            color: '#fecaca',
            padding: 10,
            borderRadius: 8,
            margin: 16,
          }}
        >
          {error}
        </div>
      )}
      <Dashboard user={user} userData={userData || {}} setError={setError} />
    </div>
  );
}
