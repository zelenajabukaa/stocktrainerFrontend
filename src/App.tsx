import React from "react";
import './App.css';
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./Home";
import Game from "./Game.tsx";
import Header from "./components/Header.tsx";

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/game" element={<Game />} />
      <Route path="/header" element={<Header />} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
};

export default App;
