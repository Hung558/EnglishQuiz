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
  }, []);

  const fetchResults = async () => {
    try {
      const res = await fetch("http://localhost:9999/api/results", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (res.ok) setResults(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6 text-indigo-700">
        Lịch sử làm bài
      </h1>
       <button
            onClick={() => navigate("/")}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg"
          >
            Quay lại
          </button>
      

      {results.length === 0 ? (
        <p className="text-gray-500">Bạn chưa làm bài nào.</p>
      ) : (
        results.map((result, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow mb-6">
            <h2 className="text-xl font-bold mb-4">
              Lần {index + 1} - Điểm: {result.score}
            </h2>

            {result.answers.map((ans, i) => {
              const isCorrect =
                ans.selectedAnswer === ans.questionId.correctAnswer;

              return (
                <div key={i} className="mb-4 p-4 border rounded-lg">
                  <p className="font-semibold">
                    {i + 1}. {ans.questionId.questionText}
                  </p>

                  <p
                    className={`mt-2 ${
                      isCorrect ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    Bạn chọn: {ans.selectedAnswer}
                  </p>

                  {!isCorrect && (
                    <p className="text-green-600">
                      Đáp án đúng: {ans.questionId.correctAnswer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ))
      )}
    </div>
  );
}