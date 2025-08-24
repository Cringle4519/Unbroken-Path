import React from "react";
import UnbrokenPath from "./UnbrokenPath";

function App() {
  return <UnbrokenPath />;
}

export default App;
import { Routes, Route } from "react-router-dom";
import UnbrokenPath from "./UnbrokenPath";
import Dashboard from "./Dashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<UnbrokenPath />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default App;
