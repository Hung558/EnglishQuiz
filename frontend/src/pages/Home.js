import React, { useState, useEffect } from "react";
import { Trash2, Send, CheckCircle, LogOut, PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [newQuiz, setNewQuiz] = useState({ questionText: "", options: ["", "", "", ""], correctAnswer: "" });
  
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Kiểm tra đăng nhập và lấy dữ liệu khi vào trang
  useEffect(() => {
    if (!token) {
      navigate("/login");
    } else {
      fetchQuestions();
    }
  }, [token, navigate]);

  // SỬA LỖI: Đã thêm Authorization Header để BE cho phép lấy dữ liệu
  const fetchQuestions = async () => {
    try {
      const res = await fetch("http://localhost:9999/api/questions", {
        headers: { 
          "Authorization": `Bearer ${token}` 
        }
      });
      const data = await res.json();
      if (res.ok) {
        setQuestions(data);
      } else {
        console.error("Lỗi từ server:", data.message);
      }
    } catch (error) {
      console.error("Không thể kết nối đến Backend:", error);
    }
  };

  // --- Dành cho ADMIN: Tạo câu hỏi ---
  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:9999/api/questions", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(newQuiz),
      });
      
      if (res.ok) {
        alert("Thêm câu hỏi thành công!");
        setNewQuiz({ questionText: "", options: ["", "", "", ""], correctAnswer: "" });
        fetchQuestions(); // Tải lại danh sách
      }
    } catch (error) {
      alert("Lỗi khi tạo câu hỏi");
    }
  };

  // --- Dành cho USER: Nộp bài ---
  const handleSubmitQuiz = async () => {
    // Kiểm tra xem đã làm hết chưa
    if (Object.keys(userAnswers).length < questions.length) {
      if (!window.confirm("Bạn chưa làm hết câu hỏi, vẫn muốn nộp chứ?")) return;
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
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ answers: formattedAnswers }),
      });
      const data = await res.json();
      if (res.ok) {
        setScore(data.score);
        alert(`Kết quả của bạn: ${data.score} / ${questions.length}`);
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
      {/* Navbar */}
      <nav className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-50">
        <h1 className="text-2xl font-extrabold text-indigo-700 tracking-tight">English Quiz</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full capitalize">
            {role}
          </span>
          <button onClick={handleLogout} className="flex items-center gap-1 text-red-500 font-semibold hover:text-red-700">
            <LogOut size={18} /> Thoát
          </button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto mt-8 px-4">
        {/* PHẦN CỦA ADMIN: THÊM CÂU HỎI */}
        {role === 'admin' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm mb-8 border-2 border-indigo-100">
            <h2 className="font-bold mb-4 text-indigo-600 text-lg flex items-center gap-2">
              <PlusCircle size={20} /> Thêm câu hỏi mới
            </h2>
            <form onSubmit={handleCreateQuestion} className="space-y-4">
              <textarea 
                placeholder="Nhập nội dung câu hỏi..." 
                value={newQuiz.questionText} 
                onChange={e => setNewQuiz({...newQuiz, questionText: e.target.value})} 
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                rows="2"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {newQuiz.options.map((opt, i) => (
                  <input 
                    key={i} 
                    placeholder={`Lựa chọn ${i+1}`} 
                    value={opt} 
                    onChange={e => {
                      const newOpts = [...newQuiz.options];
                      newOpts[i] = e.target.value;
                      setNewQuiz({...newQuiz, options: newOpts});
                    }} 
                    className="p-2 border rounded-lg focus:border-indigo-500 outline-none" 
                  />
                ))}
              </div>
              <input 
                placeholder="Đáp án đúng (Gõ y hệt 1 trong các lựa chọn trên)" 
                value={newQuiz.correctAnswer} 
                onChange={e => setNewQuiz({...newQuiz, correctAnswer: e.target.value})} 
                className="w-full p-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" 
              />
              <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
                Lưu câu hỏi vào hệ thống
              </button>
            </form>
          </div>
        )}

        {/* PHẦN CỦA USER: DANH SÁCH CÂU HỎI */}
        <div className="space-y-6">
          <div className="flex justify-between items-end">
            <h2 className="text-2xl font-bold text-gray-800">Bài tập của bạn</h2>
            <p className="text-gray-500 text-sm">{questions.length} câu hỏi</p>
          </div>

          {questions.length === 0 ? (
            <div className="bg-white p-10 rounded-2xl text-center border border-dashed border-gray-300">
              <p className="text-gray-500 italic">Chưa có câu hỏi nào. Nếu bạn là Admin, hãy thêm câu hỏi ở trên!</p>
            </div>
          ) : (
            questions.map((q, index) => (
              <div key={q._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-indigo-200 transition-all">
                <p className="font-bold text-lg mb-4 text-gray-800">
                  <span className="text-indigo-600 mr-2">Câu {index + 1}:</span>
                  {q.questionText}
                </p>
                <div className="grid grid-cols-1 gap-3">
                  {q.options.map(opt => (
                    <label 
                      key={opt} 
                      className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        userAnswers[q._id] === opt 
                        ? "bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500" 
                        : "border-gray-100 hover:bg-gray-50 hover:border-gray-200"
                      }`}
                    >
                      <input 
                        type="radio" 
                        name={q._id} 
                        className="hidden" 
                        onChange={() => setUserAnswers({...userAnswers, [q._id]: opt})} 
                      />
                      <span className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${userAnswers[q._id] === opt ? "border-indigo-500 bg-indigo-500" : "border-gray-300"}`}>
                        {userAnswers[q._id] === opt && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </span>
                      <span className={`font-medium ${userAnswers[q._id] === opt ? "text-indigo-800" : "text-gray-600"}`}>
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
              className="w-full py-4 bg-green-500 text-white rounded-2xl font-extrabold text-xl shadow-lg hover:bg-green-600 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 mt-10"
            >
              <CheckCircle /> NỘP BÀI NGAY
            </button>
          )}

          {score !== null && (
            <div className="mt-6 p-6 bg-yellow-50 border-2 border-yellow-200 rounded-2xl text-center">
              <p className="text-yellow-800 font-bold text-xl">Điểm số vừa rồi của bạn: {score} / {questions.length}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}