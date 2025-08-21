import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";

function App() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchMessages = async () => {
      const snapshot = await getDocs(collection(db, "messages"));
      setMessages(snapshot.docs.map(doc => doc.data()));
    };
    fetchMessages();
  }, []);

  return (
    <div>
      <h1>🔥 Unbroken Path Firebase Test</h1>
      <ul>
        {messages.map((m, i) => (
          <li key={i}>{m.text}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
                  
