import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Calendar, Award } from "lucide-react";

export default function AdminResults() {
  const [results, setResults] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("http://localhost:9999/api/admin/results", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setResults(data))
      .catch(err => console.error(err));
  }, [token]);

  // Nhóm kết quả theo Username
  const groupedResults = results.reduce((acc, obj) => {
    const key = obj.user?.username || "Ẩn danh";
    if (!acc[key]) acc[key] = [];
    acc[key].push(obj);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-indigo-700 flex items-center gap-2">
             <Award size={32} /> Kết quả học sinh
          </h1>
          <button 
            onClick={() => navigate("/admin")} // 👈 Quay lại trang quản lý câu hỏi
            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-bold"
          >
            <ArrowLeft size={20} /> Quay lại quản lý
          </button>
        </div>

        {Object.keys(groupedResults).map((username) => (
          <div key={username} className="bg-white shadow-md rounded-2xl p-6 mb-6 border-t-4 border-indigo-500">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-100 p-2 rounded-full text-indigo-600">
                  <User size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-800">{username}</h3>
              </div>
              <span className="text-sm font-medium text-gray-500">Đã làm: {groupedResults[username].length} lần</span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {groupedResults[username].map((res, idx) => (
                <div key={res._id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-indigo-400">Lần {groupedResults[username].length - idx}</span>
                    <div className="flex items-center gap-1 text-gray-400 text-xs">
                      <Calendar size={14} />
                      {new Date(res.createdAt).toLocaleString('vi-VN')}
                    </div>
                  </div>
                  <div className="text-xl font-black text-indigo-600">
                    {res.score} <span className="text-xs text-gray-400 font-normal">điểm</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}