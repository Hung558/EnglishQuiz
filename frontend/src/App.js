import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import AuthPage from './pages/Auth';
import AdminPage from './pages/AdminPage';
import UserPage from './pages/UserPage';
import HistoryPage from './pages/HistoryPage'; // 👈 thêm dòng này
import AdminResults from './pages/AdminResults';
import Leaderboard from './pages/Leaderboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/login" element={<AuthPage />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/results" element={<AdminResults />} />
        <Route path="/admin/leaderboard" element={<Leaderboard />} />

        {/* User */}
        <Route path="/" element={<UserPage />} />

        {/* History */}
        <Route path="/history" element={<HistoryPage />} /> {/* 👈 thêm route */}

        {/* Default */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;