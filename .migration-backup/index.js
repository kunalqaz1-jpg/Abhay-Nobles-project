const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection - Ensure MONGODB_URI is set in your Vercel Environment Variables
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Models
const Student = mongoose.models.Student || mongoose.model('Student', new mongoose.Schema({
    studentId: { type: String, required: true, unique: true },
    fullName: String,
    className: String,
    rollNo: String,
    photo: String,
    parents: [{ relation: String, name: String, phone: String }],
    fees: Object
}));

const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', new mongoose.Schema({
    className: String,
    monthLabel: String,
    records: Array // [{ studentId, daysPresent, daysAbsent, percent, calendar: [] }]
}));

const Homework = mongoose.models.Homework || mongoose.model('Homework', new mongoose.Schema({
    className: String,
    subject: String,
    title: String,
    dueDate: String,
    createdAt: { type: Date, default: Date.now }
}));

// PERSISTENCE ROUTE: Used by Teacher/Admin Dashboard to save data
app.post('/api/admin/save', async (req, res) => {
    try {
        const { type, payload } = req.body;
        
        if (type === 'student') {
            // Upsert: Updates if exists, creates if not. Prevents "erasing" on restart.
            await Student.findOneAndUpdate({ studentId: payload.studentId }, payload, { upsert: true });
        } else if (type === 'attendance') {
            await Attendance.findOneAndUpdate(
                { className: payload.className, monthLabel: payload.monthLabel },
                payload,
                { upsert: true }
            );
        } else if (type === 'homework') {
            const hw = new Homework(payload);
            await hw.save();
        }
        
        res.json({ success: true, message: "Data successfully persisted to MongoDB" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Student Portal Data Fetch
app.get('/api/students/:id/dashboard', async (req, res) => {
    try {
        const student = await Student.findOne({ studentId: req.params.id });
        if (!student) return res.status(404).json({ message: 'Student profile not found.' });

        const [attendanceDoc, homework] = await Promise.all([
            Attendance.findOne({ className: student.className }),
            Homework.find({ className: student.className }).sort({ createdAt: -1 }).limit(5)
        ]);

        const studentAttendance = attendanceDoc?.records?.find(r => r.studentId === student.studentId);

        res.json({
            student,
            attendance: studentAttendance || { percent: '0%', daysPresent: 0, daysAbsent: 0 },
            homework: homework || []
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = app;