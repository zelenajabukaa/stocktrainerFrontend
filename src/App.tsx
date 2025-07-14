import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./Home";
import Game from "./Game.tsx";

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/game" element={<Game />} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
};

export default App;
