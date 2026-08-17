const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { ensureFileExists } = require('./utils/csvManager');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Define CSV headers
const CSV_HEADERS = {
    expenses: [
        { id: 'id', title: 'id' },
        { id: 'user_id', title: 'user_id' },
        { id: 'date', title: 'date' },
        { id: 'category', title: 'category' },
        { id: 'description', title: 'description' },
        { id: 'amount', title: 'amount' },
        { id: 'payment_method', title: 'payment_method' },
        { id: 'notes', title: 'notes' },
        { id: 'created_at', title: 'created_at' }
    ],
    users: [
        { id: 'id', title: 'id' },
        { id: 'name', title: 'name' },
        { id: 'email', title: 'email' },
        { id: 'password', title: 'password' },
        { id: 'created_at', title: 'created_at' }
    ]
};

// Initialize CSV files
async function initData() {
    await ensureFileExists('users.csv', CSV_HEADERS.users);
    await ensureFileExists('expenses.csv', CSV_HEADERS.expenses);
    console.log('CSV data files initialized.');
}

initData();

// Simple auth middleware (dummy for now, just expects user_id in headers)
app.use((req, res, next) => {
    // Exclude login/register from auth check if they existed
    req.userId = req.headers['x-user-id'] || 'USER001'; // Default for testing
    next();
});

// Import Routes
const expenseRoutes = require('./routes/expenseRoutes');

// Use Routes
app.use('/api/expenses', expenseRoutes);

// Fallback route for SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
