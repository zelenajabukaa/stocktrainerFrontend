import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./Home";
import Game from "./Game.tsx";
import Login from "./components/Login.tsx";
import PrivateRoute from "./components/PrivateRoute"; // ← NEU

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
      <Route path="/game" element={<PrivateRoute><Game /></PrivateRoute>} />
    </Routes>
  );
};

export default App;
