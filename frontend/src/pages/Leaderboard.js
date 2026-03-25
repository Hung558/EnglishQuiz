import React, { useState, useEffect } from "react";
import { Trophy, Medal, User } from "lucide-react";

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    // Gọi API lấy tất cả kết quả
    fetch("http://localhost:9999/api/admin/results", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        processLeaderboard(data);
      })
      .catch(err => console.error(err));
  }, [token]);

  const processLeaderboard = (allResults) => {
    // BƯỚC 1: Lọc lấy điểm cao nhất của mỗi người
    const bestScores = allResults.reduce((acc, current) => {
      const username = current.user?.username || "Ẩn danh";
      const score = parseFloat(current.score);

      // Nếu chưa có tên người này hoặc điểm lần này cao hơn điểm đã lưu
      if (!acc[username] || score > acc[username].score) {
        acc[username] = {
          username: username,
          score: score,
          date: current.createdAt
        };
      }
      return acc;
    }, {});

    // BƯỚC 2: Chuyển Object thành Mảng và Sắp xếp giảm dần
    const sortedList = Object.values(bestScores)
      .sort((a, b) => b.score - a.score) // Sắp xếp điểm từ cao xuống thấp
      .slice(0, 10); // Chỉ lấy Top 10

    setLeaderboard(sortedList);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-500 to-purple-600 p-6 text-white">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <Trophy size={64} className="mx-auto text-yellow-300 mb-2" />
          <h1 className="text-3xl font-black uppercase tracking-widest">Bảng Xếp Hạng</h1>
          <p className="text-indigo-100 opacity-80">Những học sinh xuất sắc nhất</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden text-gray-800">
          {leaderboard.map((item, index) => (
            <div 
              key={index} 
              className={`flex items-center justify-between p-5 border-b last:border-0 ${index < 3 ? 'bg-yellow-50' : ''}`}
            >
              <div className="flex items-center gap-4">
                {/* Hiển thị số thứ tự hoặc Huy chương */}
                <div className="w-8 text-center font-black text-xl">
                  {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                </div>
                
                <div>
                  <div className="font-bold text-lg">{item.username}</div>
                  <div className="text-xs text-gray-400">
                    {new Date(item.date).toLocaleDateString('vi-VN')}
                  </div>
                </div>
              </div>

              <div className="text-2xl font-black text-indigo-600">
                {item.score} <span className="text-sm font-normal text-gray-400">đ</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}