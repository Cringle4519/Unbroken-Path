
import React, { useState, useEffect, useRef } from 'react';
import { auth, db, storage } from './firebase';
import MilestoneDashboard from './MilestoneSystem';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// ---------- Helper ----------
const createUserProfile = async (uid, email) => {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      email,
      trustScore: 25,
      avatar_likeness_url: `https://placehold.co/400x400/1a202c/ffffff?text=${email.charAt(0).toUpperCase()}`,
      original_photo_url: '',
      current_reveal_percent: 0,
      sobrietyDate: null,
      createdAt: serverTimestamp(),
      lastActive: serverTimestamp()
    });
  } else {
    await updateDoc(userRef, { lastActive: serverTimestamp() });
  }
};

// ---------- Small UI ----------
const Spinner = () => (
  <div className="flex justify-center items-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
  </div>
);

const Modal = ({ children, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
    <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-md relative border border-gray-700">
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">✕</button>
      {children}
    </div>
  </div>
);

const CrisisButton = () => {
  const [showModal, setShowModal] = useState(false);
  const crisisResources = [
    { name: "National Suicide Prevention Lifeline", number: "988", available: "24/7" },
    { name: "Crisis Text Line", number: "Text HOME to 741741", available: "24/7" },
    { name: "SAMHSA Helpline", number: "1-800-662-4357", available: "24/7" },
    { name: "Domestic Violence Hotline", number: "1-800-799-7233", available: "24/7" }
  ];

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="fixed top-4 right-4 z-40 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full shadow-lg animate-pulse"
      >🆘 Crisis Help</button>

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Crisis Resources</h2>
            <div className="space-y-4">
              {crisisResources.map((r, i) => (
                <div key={i} className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-semibold">{r.name}</h3>
                  <p className="text-blue-300 font-bold">{r.number}</p>
                  <p className="text-gray-400 text-sm">{r.available}</p>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

// ---------- Auth ----------
const AuthComponent = ({ setUser, setLoading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(true);
  const [error, setError] = useState('');

  const handleAuthAction = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isSignUp) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await createUserProfile(cred.user.uid, cred.user.email);
        setUser(cred.user);
      } else {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        await createUserProfile(cred.user.uid, cred.user.email);
        setUser(cred.user);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center p-4">
      <CrisisButton />
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-700">
        <h1 className="text-3xl font-bold text-center mb-4 text-blue-400">Unbroken Path</h1>
        {error && <p className="bg-red-500/20 text-red-300 p-2 mb-4">{error}</p>}
        <form onSubmit={handleAuthAction}>
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="Email" className="w-full mb-3 p-3 bg-gray-700 rounded"
          />
          <input
            type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Password" className="w-full mb-3 p-3 bg-gray-700 rounded"
          />
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-bold">
            {isSignUp ? 'Sign Up' : 'Log In'}
          </button>
        </form>
        <button onClick={() => setIsSignUp(!isSignUp)} className="mt-4 text-gray-400 hover:text-white">
          {isSignUp ? 'Already have an account? Log In' : 'Need an account? Sign Up'}
        </button>
      </div>
    </div>
  );
};

// ---------- Dashboard ----------
const Dashboard = ({ user, userData, setLoading, setError, setCurrentView }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const storageRef = ref(storage, `user_photos/${user.uid}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      await updateDoc(doc(db, "users", user.uid), {
        original_photo_url: url,
        photoUpdatedAt: serverTimestamp()
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      setFile(null);
    }
  };

  const handleReveal = async (percent) => {
    if (percent > userData.trustScore) return;
    await updateDoc(doc(db, "users", user.uid), {
      current_reveal_percent: percent,
      revealUpdatedAt: serverTimestamp()
    });
  };

  return (
    <div className="p-6 text-white">
      <CrisisButton />
      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <button onClick={() => signOut(auth)} className="bg-gray-600 px-4 py-2 rounded">Sign Out</button>
      </div>
      <div className="mb-6">
        <h3 className="font-bold mb-2">Identity Shield</h3>
        <img src={userData.avatar_likeness_url} alt="Avatar" className="w-32 h-32 rounded-full mx-auto mb-2" />
        <p className="text-center">{userData.email}</p>
      </div>
      <div>
        <input type="file" accept="image/*" onChange={handleFileChange} className="mb-3" />
        <button onClick={handleUpload} disabled={!file || uploading} className="bg-blue-600 px-4 py-2 rounded">
          {uploading ? 'Uploading…' : 'Upload Photo'}
        </button>
      </div>
      <div className="mt-6">
        <h4 className="font-bold">Reveal Level</h4>
        {[0,25,50,75,100].map(p => (
          <button
            key={p} onClick={() => handleReveal(p)}
            className={`px-3 py-1 m-1 rounded ${userData.current_reveal_percent === p ? 'bg-blue-600' : 'bg-gray-700'}`}
          >
            {p}%
          </button>
        ))}
      </div>
      <MilestoneDashboard user={user} userData={userData} setError={setError}/>
    </div>
  );
};

// ---------- Meeting Tile ----------
const MeetingTile = ({ participant, isLocalUser }) => {
  const { avatar_likeness_url, original_photo_url, current_reveal_percent, email } = participant;
  const [isTalking, setIsTalking] = useState(false);

  useEffect(() => {
    let audioContext, analyser, source, id;
    if (isLocalUser && navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        audioContext = new AudioContext();
        analyser = audioContext.createAnalyser();
        source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        analyser.fftSize = 32;
        const data = new Uint8Array(analyser.frequencyBinCount);
        const detect = () => {
          analyser.getByteFrequencyData(data);
          const avg = data.reduce((a,b)=>a+b)/data.length;
          setIsTalking(avg > 20);
          id = requestAnimationFrame(detect);
        };
        detect();
      });
    }
    return () => {
      if (id) cancelAnimationFrame(id);
      if (audioContext) audioContext.close();
    };
  }, [isLocalUser]);

  const getClipPath = (p) => {
    switch (p) {
      case 25: return 'inset(50% 0 0 50%)';
      case 50: return 'inset(50% 0 0 0)';
      case 75: return 'inset(0 0 0 50%)';
      case 100: return 'inset(0 0 0 0)';
      default: return 'inset(100%)';
    }
  };

  return (
    <div className={`relative aspect-square rounded-xl overflow-hidden border-4 ${isTalking ? 'border-green-400' : 'border-gray-600'}`}>
      <img src={avatar_likeness_url} alt="Avatar" className="w-full h-full object-cover" />
      {current_reveal_percent > 0 && original_photo_url && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${original_photo_url})`, clipPath: getClipPath(current_reveal_percent) }}
        ></div>
      )}
      <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">{email}</div>
    </div>
  );
};

// ---------- Export ----------
export default AuthComponent;
export { Dashboard, MeetingTile };
