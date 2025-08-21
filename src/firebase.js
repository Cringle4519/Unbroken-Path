
{
  "name": "veilmatch-unbroken-path",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "firebase": "^10.12.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build"
  }
}

# ====== FILE: firebase.json ======
{
  "hosting": {
    "public": "build",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{ "source": "**", "destination": "/index.html" }]
  }
}

# ====== FILE: .firebaserc ======
{
  "projects": {
    "default": "YOUR_PROJECT_ID"
  }
}

# ====== FILE: public/index.html ======
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <title>VeilMatch / Unbroken Path</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>

# ====== FILE: src/firebase.js ======
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// PLACEHOLDER CONFIG — replace the YOUR_* values with your Firebase Console values
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

# ====== FILE: src/App.js ======
import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";

export default function App() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(collection(db, "messages"));
        setMessages(snap.docs.map(d => d.data()));
      } catch (e) {
        console.error("Firestore test error:", e);
      }
    })();
  }, []);

  return (
    <div style={{ padding: 24, color: "#f5f5f5", background: "#0d1b2a", minHeight: "100vh" }}>
      <h1 style={{ marginTop: 0 }}>VeilMatch / Unbroken Path — Firebase Placeholder</h1>
      <p>This is a placeholder app wired to Firebase. Replace keys in <code>src/firebase.js</code>.</p>
      <h3>Firestore “messages” (if any):</h3>
      <ul>
        {messages.map((m, i) => <li key={i}>{m.text || JSON.stringify(m)}</li>)}
      </ul>
    </div>
  );
}

# ====== FILE: src/index.js ======
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

const root = createRoot(document.getElementById("root"));
root.render(<App />);
