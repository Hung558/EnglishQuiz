const express = require('express');
const cors = require('cors');
const app = express();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Import models (Bỏ Quiz)
const { User, Question, Result } = require('./models');
const verifyToken = require('./middleware/auth');

app.use(cors());
app.use(express.json());

const connectDB = require('./config/db');
connectDB();

// ===================== AUTH =====================

// Đăng ký
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "Tên đăng nhập đã tồn tại" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: "Đăng ký thành công!", user: newUser.username });
    } catch (error) {
        res.status(500).json({ message: "Lỗi Server!" });
    }
});

// Đăng nhập
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: "User không tồn tại" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Sai mật khẩu" });

        const token = jwt.sign(
            { userId: user._id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({
            message: "Đăng nhập thành công",
            token,
            username: user.username,
            role: user.role
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi Server!" });
    }
});

// ===================== QUESTIONS =====================

// Lấy tất cả câu hỏi (Chỉ lấy câu chưa bị xóa mềm)
app.get('/api/questions', verifyToken, async (req, res) => {
    try {
        const questions = await Question.find({ isDeleted: false }).sort({ createdAt: -1 });
        res.status(200).json(questions);
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi lấy câu hỏi" });
    }
});

// Thêm câu hỏi mới (Chỉ Admin)
app.post('/api/questions', verifyToken, async (req, res) => {
    try {
        if (req.userRole !== 'admin') {
            return res.status(403).json({ message: "Chỉ Admin mới được thêm câu hỏi" });
        }
        const { questionText, options, correctAnswer } = req.body;
        const newQuestion = new Question({ questionText, options, correctAnswer });
        await newQuestion.save();
        res.status(201).json({ message: "Tạo câu hỏi thành công!", question: newQuestion });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi tạo câu hỏi" });
    }
});

// Cập nhật câu hỏi
app.put('/api/questions/:id', verifyToken, async (req, res) => {
    try {
        if (req.userRole !== 'admin') {
            return res.status(403).json({ message: "Chỉ Admin mới được sửa câu hỏi" });
        }
        const { questionText, options, correctAnswer } = req.body;
        const updatedQuestion = await Question.findByIdAndUpdate(
            req.params.id,
            { questionText, options, correctAnswer },
            { new: true }
        );
        if (!updatedQuestion) return res.status(404).json({ message: "Không tìm thấy" });
        res.json({ message: "Cập nhật thành công!", question: updatedQuestion });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server khi cập nhật" });
    }
});

// Xóa câu hỏi (Sử dụng Soft Delete để bảo toàn dữ liệu lịch sử)
app.delete('/api/questions/:id', verifyToken, async (req, res) => {
    try {
        if (req.userRole !== 'admin') {
            return res.status(403).json({ message: "Chỉ Admin mới được xóa câu hỏi" });
        }
        // Thay vì xóa vĩnh viễn, ta chỉ đánh dấu isDeleted = true
        await Question.findByIdAndUpdate(req.params.id, { isDeleted: true });
        res.status(200).json({ message: "Xóa câu hỏi thành công!" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi xóa" });
    }
});

// ===================== QUIZ & RESULTS =====================

// Nộp bài thi
app.post('/api/quiz/submit', verifyToken, async (req, res) => {
    try {
        const { answers } = req.body;
        let correctCount = 0;

        // Tính điểm dựa trên database thực tế
        for (let ans of answers) {
            const question = await Question.findById(ans.questionId);
            if (question && question.correctAnswer === ans.selectedAnswer) {
                correctCount++;
            }
        }

        // Tính toán điểm số (Ví dụ thang điểm 10)
        const totalQuestions = answers.length;
        const finalScore = totalQuestions > 0 ? (correctCount / totalQuestions) * 10 : 0;

        const newResult = new Result({
            user: req.userId,
            score: finalScore.toFixed(2),
            answers: answers
        });
        await newResult.save();

        res.status(200).json({ 
            message: "Nộp bài thành công", 
            score: finalScore.toFixed(2),
            correct: correctCount 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi khi nộp bài" });
    }
});

// Lấy lịch sử bài làm của user
app.get('/api/results', verifyToken, async (req, res) => {
    try {
        const results = await Result.find({ user: req.userId })
            .populate("answers.questionId") // Link tới bảng Question
            .sort({ createdAt: -1 });

        // Vì đã dùng Soft Delete nên questionId sẽ rất hiếm khi bị null.
        // Tuy nhiên vẫn giữ filter để bảo vệ app nếu có dữ liệu rác cũ.
        const cleanedResults = results.map(result => {
            const r = result.toObject();
            if (r.answers) {
                r.answers = r.answers.filter(ans => ans.questionId !== null);
            }
            return r;
        });

        res.json(cleanedResults);
    } catch (error) {
        console.error("Lỗi lấy lịch sử:", error);
        res.status(500).json({ message: "Lỗi khi lấy lịch sử" });
    }
});

// Lấy toàn bộ kết quả của tất cả user (Dành cho Admin)
app.get('/api/admin/results', verifyToken, async (req, res) => {
    try {
        if (req.userRole !== 'admin') {
            return res.status(403).json({ message: "Quyền truy cập bị từ chối" });
        }
        const results = await Result.find()
            .populate("user", "username") // Lấy thêm tên user từ bảng User
            .populate("answers.questionId") 
            .sort({ createdAt: -1 });
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy dữ liệu" });
    }
});

// Khởi chạy Server
const PORT = process.env.PORT || 9999;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));