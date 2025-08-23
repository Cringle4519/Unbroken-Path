import React, { useEffect, useState } from "react";
import MilestoneDashboard from "./MilestoneSystem";
import { auth, db, storage } from "./firebase";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

/* ---------- helpers ---------- */

const Spinner = () => (
  <div className="flex justify-center items-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
  </div>
);

const Modal = ({ children, onClose }) => (
  <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
    <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md relative border border-gray-700">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-white"
        aria-label="Close"
      >
        ✕
      </button>
      {children}
    </div>
  </div>
);

const CrisisButton = () => {
  const [show, setShow] = useState(false);
  const resources = [
    { name: "988 Suicide & Crisis Lifeline", number: "988", hours: "24/7" },
    { name: "Crisis Text Line", number: "Text HOME to 741741", hours: "24/7" },
    { name: "SAMHSA National Helpline", number: "1-800-662-4357", hours: "24/7" },
    { name: "Domestic Violence Hotline", number: "1-800-799-7233", hours: "24/7" },
  ];

  return (
    <>
      <button
        onClick={() => setShow(true)}
        className="fixed top-4 right-4 z-40 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full shadow-lg"
      >
        🆘 Crisis Help
      </button>
      {show && (
        <Modal onClose={() => setShow(false)}>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Crisis Resources</h2>
            <p className="text-gray-300 mb-6">You are not alone. Help is available 24/7.</p>
            <div className="space-y-4">
              {resources.map((r) => (
                <div key={r.name} className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-semibold text-white">{r.name}</h3>
                  <p className="text-blue-300 text-lg font-bold">{r.number}</p>
                  <p className="text-gray-400 text-sm">{r.hours}</p>
                </div>
              ))}
            </div>
            <p className="text-gray-400 text-sm mt-6">
              If you’re in immediate danger, call 911 or go to the nearest ER.
            </p>
          </div>
        </Modal>
      )}
    </>
  );
};

async function ensureUserProfile(uid, email) {
  const uref = doc(db, "users", uid);
  const snap = await getDoc(uref);
  if (!snap.exists()) {
    await setDoc(uref, {
      email,
      trustScore: 25,
      avatar_likeness_url: `https://placehold.co/400x400/1a202c/ffffff?text=${email
        .charAt(0)
        .toUpperCase()}`,
      original_photo_url: "",
      current_reveal_percent: 0,
      sobrietyDate: null,
      createdAt: serverTimestamp(),
      lastActive: serverTimestamp(),
    });
  } else {
    await updateDoc(uref, { lastActive: serverTimestamp() });
  }
}

/* ---------- Auth ---------- */

const AuthView = ({ setLoading }) => {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [isSignUp, setIsSignUp] = useState(true);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      if (isSignUp) {
        const cred = await createUserWithEmailAndPassword(auth, email, pw);
        await ensureUserProfile(cred.user.uid, cred.user.email || email);
      } else {
        const cred = await signInWithEmailAndPassword(auth, email, pw);
        await ensureUserProfile(cred.user.uid, cred.user.email || email);
      }
    } catch (e2) {
      setErr(e2.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center p-4">
      <CrisisButton />
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-400">Unbroken Path</h1>
          <p className="text-gray-400 mt-2">Your safe space for healing and connection.</p>
        </div>
        <div className="bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-700">
          <h2 className="text-2xl font-bold text-center mb-6">
            {isSignUp ? "Create Your Account" : "Welcome Back"}
          </h2>
          {err && (
            <p className="bg-red-500/20 text-red-300 p-3 rounded-lg mb-4 text-center">
              {err}
            </p>
          )}
          <form onSubmit={submit}>
            <label className="block text-gray-400 mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full p-3 mb-4 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label className="block text-gray-400 mb-2" htmlFor="pw">
              Password
            </label>
            <input
              id="pw"
              type="password"
              className="w-full p-3 mb-6 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              required
            />

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg"
            >
              {isSignUp ? "Sign Up" : "Log In"}
            </button>
          </form>
          <button
            onClick={() => setIsSignUp((s) => !s)}
            className="w-full mt-4 text-gray-400 hover:text-white"
          >
            {isSignUp ? "Already have an account? Log In" : "Need an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ---------- Dashboard ---------- */

const Dashboard = ({ user, userData, setError }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const onChoose = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError("File must be under 5MB.");
      return;
    }
    setFile(f);
    setError("");
  };

  const upload = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }
    setError("");
    setUploading(true);
    try {
      const ts = Date.now();
      const storageRef = ref(storage, `user_photos/${user.uid}/${ts}_${file.name}`);
      const metadata = {
        contentType: file.type,
        customMetadata: { userId: user.uid, uploadedAt: new Date().toISOString() },
      };
      const snap = await uploadBytes(storageRef, file, metadata);
      const originalUrl = await getDownloadURL(snap.ref);
      const avatarUrl = `https://placehold.co/400x400/1a202c/ffffff?text=${(userData.email || "")
        .charAt(0)
        .toUpperCase()}`;

      await updateDoc(doc(db, "users", user.uid), {
        original_photo_url: originalUrl,
        avatar_likeness_url: avatarUrl,
        photoUpdatedAt: serverTimestamp(),
      });

      await addDoc(collection(db, "consent_log"), {
        userId: user.uid,
        action: "photo_upload",
        filename: file.name,
        fileSize: file.size,
        timestamp: serverTimestamp(),
      });
    } catch (e) {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      setFile(null);
    }
  };

  const setReveal = async (percent) => {
    if (percent > (userData.trustScore || 0) && percent !== 0) {
      setError(
        `Your trust score of ${userData.trustScore || 0} is not high enough to reveal ${percent}%.`
      );
      return;
    }
    setError("");
    try {
      await updateDoc(doc(db, "users", user.uid), {
        current_reveal_percent: percent,
        revealUpdatedAt: serverTimestamp(),
      });
      await addDoc(collection(db, "consent_log"), {
        userId: user.uid,
        action: "reveal_update",
        fromPercent: userData.current_reveal_percent || 0,
        toPercent: percent,
        timestamp: serverTimestamp(),
      });
    } catch {
      setError("Failed to update reveal level.");
    }
  };

  const tiers = [0, 25, 50, 75, 100];

  return (
    <div className="p-4 md:p-8">
      <CrisisButton />
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Your Dashboard</h2>
        <button
          onClick={() => signOut(auth)}
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg"
        >
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {/* Milestones */}
        <div className="lg:col-span-1">
          <MilestoneDashboard user={user} userData={userData} setError={setError} />
        </div>

        {/* Identity Shield */}
        <div className="lg:col-span-1 bg-gray-800 p-6 rounded-2xl border border-gray-700">
          <h3 className="text-xl font-bold mb-4">Your Identity Shield</h3>
          <img
            src={userData.avatar_likeness_url || ""}
            alt="Avatar"
            className="w-48 h-48 rounded-full mx-auto mb-4 border-4 border-gray-700 object-cover"
          />
          <p className="text-center text-gray-400 mb-2">{userData.email}</p>
          <p className="text-center text-gray-300 mb-6">
            Your User ID:{" "}
            <code className="text-sm bg-gray-700 px-2 py-1 rounded">{user.uid}</code>
          </p>

          <h4 className="font-semibold mt-6 mb-2">Update Your Photo</h4>
          <p className="text-sm text-gray-400 mb-4">
            Your original photo is stored privately and used only for reveal.
          </p>

          <input
            type="file"
            accept="image/*"
            onChange={onChoose}
            className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-blue-500/10 file:text-blue-300 hover:file:bg-blue-500/20"
          />
          <button
            onClick={upload}
            disabled={!file || uploading}
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {uploading ? <Spinner /> : "Upload & Generate Avatar"}
          </button>
        </div>

        {/* Reveal controls */}
        <div className="lg:col-span-2 bg-gray-800 p-6 rounded-2xl border border-gray-700">
          <h3 className="text-xl font-bold mb-2">IronWall Reveal Protocol</h3>
          <p className="text-gray-400 mb-6">
            You control how much of your identity you share in meetings.
          </p>

          <div className="bg-gray-900/50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">Your Trust Score:</span>
              <span className="text-2xl font-bold text-green-400">
                {userData.trustScore || 0}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-green-500 h-2.5 rounded-full"
                style={{ width: `${userData.trustScore || 0}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Your trust score increases with positive community engagement.
            </p>
          </div>

          <div className="mt-8">
            <label className="block text-gray-400 mb-4 font-semibold">
              Set Your Reveal Level:
            </label>
            <div className="flex justify-between items-center gap-2">
              {tiers.map((t) => {
                const disabled = t > (userData.trustScore || 0) && t !== 0;
                const active = (userData.current_reveal_percent || 0) === t;
                return (
                  <button
                    key={t}
                    onClick={() => setReveal(t)}
                    disabled={disabled}
                    className={[
                      "flex-1 py-3 rounded-lg font-bold transition-all",
                      active
                        ? "bg-blue-600 text-white ring-2 ring-blue-400"
                        : "bg-gray-700 hover:bg-gray-600",
                      disabled ? "opacity-50 cursor-not-allowed" : "",
                    ].join(" ")}
                  >
                    {t}%
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Levels above your trust score are disabled.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------- Main ---------- */

export default function UnbrokenPath() {
  const [loading, setLoading] = useState(true);
  const [authedUser, setAuthedUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setAuthedUser(u || null);
      setUserData(null);
      setErr("");
      if (!u) {
        setLoading(false);
        return;
      }
      // live user doc
      const stopDoc = onSnapshot(
        doc(db, "users", u.uid),
        (snap) => {
          if (snap.exists()) setUserData({ id: snap.id, ...snap.data() });
          setLoading(false);
        },
        (e) => {
          setErr(e.message || "Failed to load user profile.");
          setLoading(false);
        }
      );
      return () => stopDoc();
    });
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {err && (
        <div className="bg-red-600 text-white p-3 text-center">
          <span>{err}</span>
          <button
            onClick={() => setErr("")}
            className="ml-4 text-red-200 hover:text-white underline"
          >
            Dismiss
          </button>
        </div>
      )}
      {!authedUser || !userData ? (
        <AuthView setLoading={setLoading} />
      ) : (
        <Dashboard user={authedUser} userData={userData} setError={setErr} />
      )}
    </div>
  );
  }
