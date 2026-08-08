const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'submissions.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files (index.html)
app.use(express.static(__dirname));

// Ensure submissions file exists
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

// POST endpoint
app.post('/api/contact', (req, res) => {
    try {
        const { fullName, phone, message } = req.body;

        if (!fullName || !phone || !message) {
            return res.status(400).json({ 
                success: false, 
                message: 'All fields are required.' 
            });
        }

        const newSubmission = {
            id: Date.now(),
            fullName: fullName.trim(),
            phone: phone.trim(),
            message: message.trim(),
            submittedAt: new Date().toISOString()
        };

        const fileData = fs.readFileSync(DATA_FILE, 'utf8');
        const submissions = JSON.parse(fileData || '[]');

        submissions.push(newSubmission);
        fs.writeFileSync(DATA_FILE, JSON.stringify(submissions, null, 2));

        console.log(`[${new Date().toLocaleTimeString()}] Submission received from: ${fullName}`);

        return res.status(200).json({ 
            success: true, 
            message: 'Your inquiry has been successfully submitted!' 
        });

    } catch (error) {
        console.error('Error saving submission:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Server error. Please try again later.' 
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});