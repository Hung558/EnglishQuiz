// import React from 'react';
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import AuthPage from './pages/Auth';
// import Home from './pages/Home';
// import AdminPage from './pages/AdminPage';
// import UserPage from './pages/UserPage';

// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         {/* <Route path="/" element={<Home />} />
//         <Route path="/login" element={<AuthPage />} />
//         <Route path="*" element={<Navigate to="/" />} /> */}
//         <Route path="/login" element={<AuthPage />} />
//         <Route path="/admin" element={<AdminPage />} />
//         <Route path="/" element={<UserPage />} />   {/* Trang mặc định cho User */}
//         <Route path="*" element={<Navigate to="/login" />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;


import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import AuthPage from './pages/Auth';
import AdminPage from './pages/AdminPage';
import UserPage from './pages/UserPage';
import HistoryPage from './pages/HistoryPage'; // 👈 thêm dòng này

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/login" element={<AuthPage />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminPage />} />

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