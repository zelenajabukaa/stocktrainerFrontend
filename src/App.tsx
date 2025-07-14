import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./Home";
import Game from "./Game.tsx";
import Login from "./components/Login.tsx";

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/home" element={<Home />} />
      <Route path="/game" element={<Game />} />
      <Route path="/" element={<Login />} />
    </Routes>
  );
};

export default App;
