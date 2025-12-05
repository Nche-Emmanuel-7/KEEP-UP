class ExpenseTracker {
    constructor() {
        this.transactions = this.loadTransactions();
        this.currentFilter = 'all';
        this.initializeApp();
    }

    initializeApp() {
        this.setupEventListeners();
        this.updateDashboard();
        this.renderTransactions();
        this.loadTheme();
    }

    setupEventListeners() {
        // Form submission
        document.getElementById('transactionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTransaction();
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });
    }

    addTransaction() {
        const description = document.getElementById('description').value.trim();
        const amount = parseFloat(document.getElementById('amount').value);
        const type = document.getElementById('type').value;

        if (!description || !amount || !type) {
            this.showNotification('Please fill in all fields', 'error');
            return;
        }

        const transaction = {
            id: Date.now().toString(),
            description,
            amount: type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
            type,
            date: new Date().toISOString()
        };

        this.transactions.unshift(transaction);
        this.saveTransactions();
        this.updateDashboard();
        this.renderTransactions();
        this.clearForm();
        this.showNotification(`${type === 'income' ? 'Income' : 'Expense'} Added successfully!`, 'success');
    }

    deleteTransaction(id) {
        this.transactions = this.transactions.filter(t => t.id !== id);
        this.saveTransactions();
        this.updateDashboard();
        this.renderTransactions();
        this.showNotification('Transaction deleted', 'success');
    }

    updateDashboard() {
        const totalIncome = this.transactions
            .filter(t => t.amount > 0)
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpense = Math.abs(this.transactions
            .filter(t => t.amount < 0)
            .reduce((sum, t) => sum + t.amount, 0));

        const totalBalance = totalIncome - totalExpense;

        document.getElementById('totalBalance').textContent = this.formatCurrency(totalBalance);
        document.getElementById('totalIncome').textContent = this.formatCurrency(totalIncome);
        document.getElementById('totalExpense').textContent = this.formatCurrency(totalExpense);
    }

    renderTransactions() {
        const container = document.getElementById('transactionList');
        let filteredTransactions = this.transactions;

        if (this.currentFilter !== 'all') {
            filteredTransactions = this.transactions.filter(t => t.type === this.currentFilter);
        }

        if (filteredTransactions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
                    </svg>
                    <p>No ${this.currentFilter === 'all' ? 'transactions' : this.currentFilter} found.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filteredTransactions.map(transaction => `
            <div class="transaction-item fade-in">
                <div class="transaction-info">
                    <div class="transaction-description">${transaction.description}</div>
                    <div class="transaction-date">${this.formatDate(transaction.date)}</div>
                </div>
                <div class="transaction-amount ${transaction.type}">
                    ${this.formatCurrency(Math.abs(transaction.amount))}
                </div>
                <button class="delete-btn" onclick="tracker.deleteTransaction('${transaction.id}')" title="Delete transaction">
                    <img src="delete.svg" alt="Delete">
                </button>
            </div>
        `).join('');
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });

        this.renderTransactions();
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        const themeToggle = document.getElementById('themeToggle');
        themeToggle.textContent = newTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        const themeToggle = document.getElementById('themeToggle');
        themeToggle.textContent = savedTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
    }

    clearForm() {
        document.getElementById('transactionForm').reset();
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('fr-CM', {
            style: 'currency',
            currency: 'XAF'
        }).format(amount);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    saveTransactions() {
        try {
            localStorage.setItem('expense-tracker-data', JSON.stringify(this.transactions));
        } catch (error) {
            console.warn('Could not save to localStorage, using memory storage instead');
        }
    }

    loadTransactions() {
        try {
            const data = localStorage.getItem('expense-tracker-data');
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.warn('Could not load from localStorage, starting with empty data');
            return [];
        }
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.tracker = new ExpenseTracker();
});