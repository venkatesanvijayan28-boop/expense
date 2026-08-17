const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { readRecords, appendRecord, updateRecord, deleteRecord } = require('../utils/csvManager');

const FILENAME = 'expenses.csv';
const HEADERS = [
    { id: 'id', title: 'id' },
    { id: 'user_id', title: 'user_id' },
    { id: 'date', title: 'date' },
    { id: 'category', title: 'category' },
    { id: 'description', title: 'description' },
    { id: 'amount', title: 'amount' },
    { id: 'payment_method', title: 'payment_method' },
    { id: 'notes', title: 'notes' },
    { id: 'created_at', title: 'created_at' }
];

// GET /api/expenses
router.get('/', async (req, res, next) => {
    try {
        const records = await readRecords(FILENAME);
        const userExpenses = records.filter(r => r.user_id === req.userId);
        res.json(userExpenses);
    } catch (error) {
        next(error);
    }
});

// POST /api/expenses
router.post('/', async (req, res, next) => {
    try {
        const { date, category, description, amount, payment_method, notes } = req.body;
        
        if (!amount || isNaN(amount)) {
            return res.status(400).json({ error: 'Please enter a valid amount.' });
        }

        const newExpense = {
            id: uuidv4(),
            user_id: req.userId,
            date,
            category,
            description,
            amount,
            payment_method,
            notes: notes || '',
            created_at: new Date().toISOString().split('T')[0]
        };

        await appendRecord(FILENAME, HEADERS, newExpense);
        res.status(201).json({ message: 'Expense added successfully', expense: newExpense });
    } catch (error) {
        next(error);
    }
});

// PUT /api/expenses/:id
router.put('/:id', async (req, res, next) => {
    try {
        const updatedExpense = await updateRecord(FILENAME, HEADERS, req.params.id, req.body);
        if (updatedExpense) {
            res.json({ message: 'Expense updated successfully', expense: updatedExpense });
        } else {
            res.status(404).json({ error: 'Expense not found.' });
        }
    } catch (error) {
        next(error);
    }
});

// DELETE /api/expenses/:id
router.delete('/:id', async (req, res, next) => {
    try {
        const success = await deleteRecord(FILENAME, HEADERS, req.params.id);
        if (success) {
            res.json({ message: 'Expense deleted successfully.' });
        } else {
            res.status(404).json({ error: 'Expense not found.' });
        }
    } catch (error) {
        next(error);
    }
});

module.exports = router;
