import React, { useState, useEffect } from "react";
import { Trash2, PlusCircle, Edit2, Save, X, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminPage() {
  const [questions, setQuestions] = useState([]);
  const [newQuiz, setNewQuiz] = useState({
    questionText: "",
    options: ["", "", "", ""],
    correctAnswer: ""
  });
  const [editingQuestion, setEditingQuestion] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  useEffect(() => {
    if (!token || role !== "admin") {
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
      if (res.ok) setQuestions(data);
    } catch (error) {
      console.error("Lỗi lấy câu hỏi:", error);
    }
  };

  // Thêm câu hỏi mới
  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:9999/api/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newQuiz)
      });

      if (res.ok) {
        alert("Thêm câu hỏi thành công!");
        setNewQuiz({ questionText: "", options: ["", "", "", ""], correctAnswer: "" });
        fetchQuestions();
      } else {
        const data = await res.json();
        alert(data.message || "Lỗi khi thêm câu hỏi");
      }
    } catch (error) {
      alert("Lỗi kết nối server");
    }
  };

  // Bắt đầu sửa
  const startEdit = (q) => setEditingQuestion({ ...q });

  // Lưu sửa câu hỏi (ĐÃ SỬA)
  const handleUpdateQuestion = async () => {
    if (!editingQuestion) return;

    try {
      const res = await fetch(`http://localhost:9999/api/questions/${editingQuestion._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          questionText: editingQuestion.questionText,
          options: editingQuestion.options,
          correctAnswer: editingQuestion.correctAnswer
        })
      });

      const data = await res.json();

      if (res.ok) {
        alert("Cập nhật câu hỏi thành công!");
        setEditingQuestion(null);
        fetchQuestions();
      } else {
        alert(data.message || "Lỗi khi cập nhật");
      }
    } catch (error) {
      console.error(error);
      alert("Lỗi kết nối server");
    }
  };

  // Xóa câu hỏi
  const handleDeleteQuestion = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa câu hỏi này?")) return;

    try {
      const res = await fetch(`http://localhost:9999/api/questions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        fetchQuestions();
      } else {
        const data = await res.json();
        alert(data.message || "Lỗi khi xóa");
      }
    } catch (error) {
      alert("Lỗi kết nối server");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10 font-sans">
      <nav className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-50">
        <h1 className="text-2xl font-extrabold text-indigo-700">English Quiz - Admin</h1>
        <div className="flex items-center gap-4">
          <span className="bg-indigo-100 text-indigo-700 px-4 py-1 rounded-full font-medium">ADMIN</span>
          <button onClick={handleLogout} className="flex items-center gap-2 text-red-600 hover:text-red-700 font-semibold">
            <LogOut size={20} /> Thoát
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto mt-8 px-4">
        {/* Form thêm câu hỏi */}
        <div className="bg-white p-6 rounded-2xl shadow mb-8 border border-indigo-100">
          <h2 className="text-xl font-bold text-indigo-600 mb-4 flex items-center gap-2">
            <PlusCircle size={24} /> Thêm câu hỏi mới
          </h2>
          <form onSubmit={handleCreateQuestion} className="space-y-4">
            <textarea
              placeholder="Nội dung câu hỏi..."
              value={newQuiz.questionText}
              onChange={(e) => setNewQuiz({ ...newQuiz, questionText: e.target.value })}
              className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-indigo-500"
              rows="3"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {newQuiz.options.map((opt, i) => (
                <input
                  key={i}
                  placeholder={`Lựa chọn ${i + 1}`}
                  value={opt}
                  onChange={(e) => {
                    const newOpts = [...newQuiz.options];
                    newOpts[i] = e.target.value;
                    setNewQuiz({ ...newQuiz, options: newOpts });
                  }}
                  className="p-3 border rounded-xl focus:border-indigo-500"
                />
              ))}
            </div>

            <input
              placeholder="Đáp án đúng (gõ đúng một lựa chọn)"
              value={newQuiz.correctAnswer}
              onChange={(e) => setNewQuiz({ ...newQuiz, correctAnswer: e.target.value })}
              className="w-full p-3 border border-green-400 rounded-xl focus:ring-2 focus:ring-green-500"
            />

            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold text-lg">
              Lưu câu hỏi vào hệ thống
            </button>
          </form>
        </div>

        {/* Danh sách câu hỏi */}
        <h2 className="text-2xl font-bold mb-6">Quản lý câu hỏi ({questions.length})</h2>

        {questions.map((q, index) => (
          <div key={q._id} className="bg-white rounded-2xl shadow p-6 mb-6">
            {editingQuestion && editingQuestion._id === q._id ? (
              <div className="space-y-4">
                <textarea
                  value={editingQuestion.questionText}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, questionText: e.target.value })}
                  className="w-full p-4 border rounded-xl"
                  rows="3"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {editingQuestion.options.map((opt, i) => (
                    <input
                      key={i}
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...editingQuestion.options];
                        newOpts[i] = e.target.value;
                        setEditingQuestion({ ...editingQuestion, options: newOpts });
                      }}
                      className="p-3 border rounded-xl"
                    />
                  ))}
                </div>
                <input
                  value={editingQuestion.correctAnswer}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, correctAnswer: e.target.value })}
                  className="w-full p-3 border border-green-400 rounded-xl"
                />
                <div className="flex gap-3">
                  <button 
                    onClick={handleUpdateQuestion} 
                    className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                  >
                    <Save size={20} /> Lưu thay đổi
                  </button>
                  <button 
                    onClick={() => setEditingQuestion(null)} 
                    className="flex-1 bg-gray-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                  >
                    <X size={20} /> Hủy
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between mb-4">
                  <p className="font-bold text-lg">
                    Câu {index + 1}: {q.questionText}
                  </p>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(q)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Edit2 size={22} />
                    </button>
                    <button onClick={() => handleDeleteQuestion(q._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 size={22} />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {q.options.map((opt, i) => (
                    <div
                      key={i}
                      className={`p-4 rounded-xl border-2 ${opt === q.correctAnswer ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
                    >
                      {opt} 
                      {opt === q.correctAnswer && <span className="text-green-600 ml-2">(Đáp án đúng)</span>}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}