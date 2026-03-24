import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';

export default function AuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [authData, setAuthData] = useState({ username: "", password: "", confirmPassword: "" });

  const handleChange = (e) => {
    setAuthData({ ...authData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? '/api/login' : '/api/register';

    if (!isLogin && authData.password !== authData.confirmPassword) {
      return alert("Mật khẩu xác nhận không khớp!");
    }

    try {
      const response = await fetch(`http://localhost:9999${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: authData.username, 
          password: authData.password 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (isLogin) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('role', data.role);

          alert(`Chào mừng ${data.username || ''}!`);

          // Redirect theo role
          if (data.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/');
          }
        } else {
          alert("Đăng ký thành công! Hãy đăng nhập ngay.");
          setIsLogin(true);
        }
      } else {
        alert(data.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      alert("Lỗi kết nối đến Server!");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-indigo-700">English Quiz Pro</h1>
        <p className="text-indigo-500 mt-2 font-medium">Nâng tầm trình độ tiếng Anh</p>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="flex mb-6 border-b">
          <button 
            onClick={() => setIsLogin(true)} 
            className={`flex-1 py-2 ${isLogin ? "border-b-2 border-indigo-600 text-indigo-600 font-bold" : "text-gray-400"}`}
          >
            Đăng nhập
          </button>
          <button 
            onClick={() => setIsLogin(false)} 
            className={`flex-1 py-2 ${!isLogin ? "border-b-2 border-indigo-600 text-indigo-600 font-bold" : "text-gray-400"}`}
          >
            Đăng ký
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="text" 
            name="username" 
            placeholder="Tên đăng nhập" 
            onChange={handleChange} 
            className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" 
            required 
          />
          <input 
            type="password" 
            name="password" 
            placeholder="Mật khẩu" 
            onChange={handleChange} 
            className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" 
            required 
          />
          {!isLogin && (
            <input 
              type="password" 
              name="confirmPassword" 
              placeholder="Xác nhận mật khẩu" 
              onChange={handleChange} 
              className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" 
              required 
            />
          )}
          <button 
            type="submit" 
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
          >
            {isLogin ? "Đăng nhập" : "Đăng ký"}
          </button>
        </form>
      </div>
    </div>
  );
}