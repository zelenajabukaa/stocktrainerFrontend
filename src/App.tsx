import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./Home";
import Game from "./Game.tsx";
import Login from "./components/Login.tsx";
import PrivateRoute from "./components/PrivateRoute"; // ← NEU
import Weekly from "./Weekly.tsx";
import Quests from "./components/Quests.tsx";

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/test/quests" element={<Quests />} />
      <Route path="/game/monthly" element={<Game />} />
      <Route path="/game/weekly" element={<Weekly />} />
      <Route path="/" element={<Login />} />
      <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
      <Route path="/game" element={<PrivateRoute><Game /></PrivateRoute>} />
      <Route path="/quests" element={<PrivateRoute><Quests /></PrivateRoute>} />
    </Routes>
  );
};

export default App;
