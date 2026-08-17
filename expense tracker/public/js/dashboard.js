document.addEventListener('DOMContentLoaded', () => {
    // Theme toggling
    const themeToggle = document.getElementById('theme-toggle');
    if (localStorage.getItem('theme') === 'light') {
        document.body.classList.remove('dark-mode');
    }
    
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });

    // Chart.js Mock Data
    const ctx = document.getElementById('categoryChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Food', 'Rent', 'Transport', 'Shopping', 'Utilities', 'Others'],
            datasets: [{
                data: [25, 30, 12, 15, 10, 8],
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // Form submission
    document.getElementById('addExpenseForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const expense = {
            amount: document.getElementById('amount').value,
            category: document.getElementById('category').value,
            description: document.getElementById('description').value,
            date: document.getElementById('date').value,
            payment_method: 'UPI' // hardcoded for simplicity in this skeleton
        };

        try {
            const response = await fetch('/api/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(expense)
            });
            const data = await response.json();
            
            if (response.ok) {
                alert('Expense added successfully ✓');
                closeModal();
                // Optionally reload data here
            } else {
                alert(data.error || 'Failed to add expense');
            }
        } catch (err) {
            console.error('Error adding expense:', err);
            alert('Something went wrong.');
        }
    });
});

function openModal() {
    document.getElementById('expenseModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('expenseModal').style.display = 'none';
}
