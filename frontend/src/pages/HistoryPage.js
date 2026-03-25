import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HistoryPage() {
  const [results, setResults] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
    } else {
      fetchResults();
    }
  }, [token, navigate]);

  const fetchResults = async () => {
    try {
      const res = await fetch("http://localhost:9999/api/results", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        // Giả sử API trả về mảng từ Mới nhất -> Cũ nhất
        setResults(data);
      }
    } catch (error) {
      console.error("Lỗi khi lấy lịch sử:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-indigo-700">
            Lịch sử làm bài
          </h1>
          <button
            onClick={() => navigate("/")}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-2 rounded-lg transition-colors font-medium"
          >
            ← Quay lại
          </button>
        </div>

        {results.length === 0 ? (
          <div className="bg-white p-10 rounded-xl shadow text-center">
            <p className="text-gray-500">Bạn chưa làm bài nào.</p>
          </div>
        ) : (
          results.map((result, index) => {
            // Logic tính số thứ tự: Tổng số bài - vị trí hiện tại
            const displayIteration = results.length - index;

            return (
              <div key={result._id || index} className="bg-white p-6 rounded-xl shadow-md mb-8 border-t-4 border-indigo-500">
                <div className="flex justify-between items-center mb-6 border-b pb-2">
                  <h2 className="text-xl font-bold text-gray-800">
                    Lần làm bài thứ: {displayIteration}
                  </h2>
                  <span className="text-2xl font-black text-indigo-600">
                    {result.score} điểm
                  </span>
                </div>

                <div className="space-y-4">
                  {result.answers.map((ans, i) => {
                    const isCorrect = ans.selectedAnswer === ans.questionId.correctAnswer;

                    return (
                      <div key={i} className={`p-4 rounded-lg border ${isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                        <p className="font-semibold text-gray-800">
                          Câu {i + 1}: {ans.questionId.questionText}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3 text-sm">
                          <p className={`${isCorrect ? "text-green-700" : "text-red-700"} font-medium`}>
                            ● Bạn chọn: <span className="underline">{ans.selectedAnswer}</span>
                          </p>
                          
                          {!isCorrect && (
                            <p className="text-green-700 font-medium">
                              ✓ Đáp án đúng: <span className="font-bold">{ans.questionId.correctAnswer}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}