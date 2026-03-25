import React, { useState, useEffect } from "react";
import { CheckCircle, LogOut, History } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function UserPage() {
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [score, setScore] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Thuật toán trộn mảng Fisher-Yates
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => {
    if (!token || role !== "user") {
      navigate("/login");
    } else {
      fetchQuestions();
    }
  }, [token, role, navigate]);

  const fetchQuestions = async () => {
    try {
      const res = await fetch("http://localhost:9999/api/questions", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        // TRỘN CÂU HỎI NGAY KHI LẤY VỀ
        setQuestions(shuffleArray(data));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmitQuiz = async () => {
    if (Object.keys(userAnswers).length < questions.length) {
      if (!window.confirm("Bạn chưa trả lời hết tất cả câu hỏi. Vẫn muốn nộp?")) return;
    }

    const formattedAnswers = Object.keys(userAnswers).map(qId => ({
      questionId: qId,
      selectedAnswer: userAnswers[qId]
    }));

    try {
      const res = await fetch("http://localhost:9999/api/quiz/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ answers: formattedAnswers })
      });

      const data = await res.json();
      if (res.ok) {
        setScore(data.score);
        alert(`Nộp bài thành công! Bạn được ${data.score} / ${questions.length} điểm`);

        // RESET VÀ TRỘN LẠI CÂU HỎI CHO LẦN LÀM TIẾP THEO
        setUserAnswers({});
        setQuestions(shuffleArray(questions)); // Trộn lại danh sách hiện tại
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      alert("Lỗi khi nộp bài");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10 font-sans">
      <nav className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-50">
        <h1 className="text-2xl font-extrabold text-indigo-700">English Quiz</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/history")}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <History size={18} /> Xem lịch sử
          </button>
          <span className="bg-indigo-100 text-indigo-700 px-4 py-1 rounded-full font-medium capitalize">{role}</span>
          <button onClick={handleLogout} className="flex items-center gap-2 text-red-600 hover:text-red-700 font-semibold">
            <LogOut size={20} /> Thoát
          </button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto mt-8 px-4">
        {score !== null && (
          <div className="mb-8 p-6 bg-green-100 border-2 border-green-500 rounded-2xl text-center">
            <p className="text-2xl font-bold text-green-800">Kết quả vừa nộp: {score} / {questions.length} điểm</p>
            <p className="text-sm text-green-600 mt-2 italic">(Câu hỏi đã được tự động trộn lại cho lượt làm mới)</p>
          </div>
        )}

        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Bài tập của bạn</h2>
          <p className="text-gray-500">{questions.length} câu hỏi</p>
        </div>

        {questions.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-gray-300">
            <p className="text-gray-500 italic">Chưa có câu hỏi nào.</p>
          </div>
        ) : (
          questions.map((q, index) => (
            <div key={q._id} className="bg-white p-6 rounded-2xl shadow-sm mb-6 border border-gray-100">
              <p className="font-bold text-lg mb-4">
                <span className="text-indigo-600">Câu {index + 1}:</span> {q.questionText}
              </p>
              <div className="space-y-3">
                {/* TRỘN CẢ THỨ TỰ ĐÁP ÁN (Nếu bạn muốn khó hơn) */}
                {q.options.map((opt, optIndex) => (
                  <label
                    key={opt}
                    className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${userAnswers[q._id] === opt
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    <input
                      type="radio"
                      name={q._id}
                      className="hidden"
                      checked={userAnswers[q._id] === opt}
                      onChange={() => setUserAnswers({ ...userAnswers, [q._id]: opt })}
                    />
                    <div className={`w-5 h-5 mr-3 rounded-full border-2 flex items-center justify-center ${userAnswers[q._id] === opt ? "border-indigo-500 bg-indigo-500" : "border-gray-300"
                      }`}>
                      {userAnswers[q._id] === opt && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <span className="font-medium text-gray-700">
                       {opt}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))
        )}

        {questions.length > 0 && (
          <button
            onClick={handleSubmitQuiz}
            className="w-full mt-8 py-5 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold text-xl flex items-center justify-center gap-3 shadow-lg transition-transform active:scale-95"
          >
            <CheckCircle size={28} /> NỘP BÀI VÀ TRỘN ĐỀ MỚI
          </button>
        )}
      </div>
    </div>
  );
}