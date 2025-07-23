import Leaderboard from './Leaderboard';
import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./Home";
import Game from "./Game.tsx";
import Login from "./components/Login.tsx";
import PrivateRoute from "./components/PrivateRoute";
import Weekly from "./Weekly.tsx";
import Quests from "./components/Quests.tsx";
import AvatarSettings from "./components/AvatarSettings.tsx";
import Settings from "./components/Settings.tsx";
import Levelbelohnungen from "./components/Levelbelohnungen.tsx";
import Successes from "./components/Successes.tsx";
import Auswertungen from "./components/Auswertungen.tsx";
import Infos from './components/Infos';
import Friends from "./components/Friends.tsx";
import Shop from "./components/Shop.tsx"; // ← NEU HINZUGEFÜGT

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/test/quests" element={<Quests />} />
      <Route path="/user/avatar" element={<PrivateRoute><AvatarSettings /></PrivateRoute>} />
      <Route path="/user/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
      <Route path="/user/successes" element={<Successes />} />
      <Route path="/game/monthly" element={<Game />} />
      <Route path="/game/weekly" element={<Weekly />} />
      <Route path="/" element={<Login />} />
      <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
      <Route path="/game" element={<PrivateRoute><Game /></PrivateRoute>} />
      <Route path="/quests" element={<PrivateRoute><Quests /></PrivateRoute>} />
      <Route path="/levelbelohnungen" element={<PrivateRoute><Levelbelohnungen /></PrivateRoute>} />
      <Route path="/auswertungen" element={<PrivateRoute><Auswertungen /></PrivateRoute>} />
      <Route path="/informations" element={<PrivateRoute><Infos /></PrivateRoute>} />
      <Route path="/friends" element={<PrivateRoute><Friends /></PrivateRoute>} />
      <Route path="/shop" element={<PrivateRoute><Shop /></PrivateRoute>} /> {/* ← NEU */}
      <Route path="/leaderboard" element={<Leaderboard />} />
    </Routes>
  );
};

export default App;