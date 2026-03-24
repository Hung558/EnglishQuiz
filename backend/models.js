const mongoose = require('mongoose');

// ==================== USER SCHEMA ====================
const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    role: { 
        type: String, 
        enum: ['user', 'admin'], 
        default: 'user' 
    }
}, { timestamps: true });

// ==================== QUESTION SCHEMA ====================
const questionSchema = new mongoose.Schema({
    questionText: { 
        type: String, 
        required: true,
        trim: true
    },
    options: [{ 
        type: String, 
        required: true 
    }],
    correctAnswer: { 
        type: String, 
        required: true 
    },
    // Quan trọng: Dùng để ẩn câu hỏi mà không làm mất dữ liệu lịch sử
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// ==================== RESULT SCHEMA ====================
const resultSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    score: { 
        type: Number, 
        required: true 
    },
    answers: [{
        questionId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Question',
            required: true 
        },
        selectedAnswer: { 
            type: String,
            default: ""
        }
    }]
}, { timestamps: true });

module.exports = {
    User: mongoose.model('User', userSchema),
    Question: mongoose.model('Question', questionSchema),
    Result: mongoose.model('Result', resultSchema)
};