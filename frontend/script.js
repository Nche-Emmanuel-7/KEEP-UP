class ExpenseTracker {
    constructor() {
        // ORIGINAL
        this.transactions = this.loadTransactions();
        this.currentFilter = 'all';
        this.initializeApp();
    }

    initializeApp() {
        // ORIGINAL
        this.setupEventListeners();
        this.updateDashboard();
        this.renderTransactions();
        this.loadTheme();

        // ✅ ADDED (backend load – does not remove original)
        this.loadTransactionsFromBackend();

        // ✅ NEW: Load username from PHP session
        this.loadUsernameFromSession();
    }

    setupEventListeners() {
        // ORIGINAL: Form submission
        document.getElementById('transactionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTransaction();
        });

        // ORIGINAL: Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // ORIGINAL: Theme toggle
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

        // ✅ ADDED: SEND TO BACKEND (does not replace local logic)
        fetch("../backend/add_transaction.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `description=${encodeURIComponent(description)}&amount=${amount}&type=${type}`
        })
        .then(res => res.text())
        .then(response => {
            if (!response.includes("success")) {
                this.showNotification(response, 'error');
                return;
            }
        });

        // ORIGINAL LOGIC (UNCHANGED)
        this.transactions.unshift(transaction);
        this.saveTransactions();
        this.updateDashboard();
        this.renderTransactions();
        this.clearForm();
        this.showNotification(
            `${type === 'income' ? 'Income' : 'Expense'} added successfully!`,
            'success'
        );
    }

    deleteTransaction(id) {
        // ✅ ADDED: BACKEND DELETE (soft delete)
        fetch("../backend/delete_transaction.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `id=${id}`
        });

        // ORIGINAL LOGIC (UNCHANGED)
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

        const totalExpense = Math.abs(
            this.transactions
                .filter(t => t.amount < 0)
                .reduce((sum, t) => sum + t.amount, 0)
        );

        const totalBalance = totalIncome - totalExpense;

        document.getElementById('totalBalance').textContent = this.formatCurrency(totalBalance);
        document.getElementById('totalIncome').textContent = this.formatCurrency(totalIncome);
        document.getElementById('totalExpense').textContent = this.formatCurrency(totalExpense);
    }

    renderTransactions() {
        const container = document.getElementById('transactionList');
        let filteredTransactions = this.transactions;

        if (this.currentFilter !== 'all') {
            filteredTransactions = this.transactions.filter(
                t => t.type === this.currentFilter
            );
        }

        if (filteredTransactions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
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
                <button class="delete-btn" data-id="${transaction.id}" title="Delete transaction">
                    <img src="delete.svg" alt="Delete">
                </button>
            </div>
        `).join('');

        container.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.deleteTransaction(btn.dataset.id);
            });
        });
    }

    setFilter(filter) {
        this.currentFilter = filter;

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

        document.getElementById('themeToggle').textContent =
            newTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);

        document.getElementById('themeToggle').textContent =
            savedTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
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
        return new Date(dateString).toLocaleString();
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
            localStorage.setItem(
                'expense-tracker-data',
                JSON.stringify(this.transactions)
            );
        } catch (error) {
            console.warn('Could not save to localStorage');
        }
    }

    loadTransactions() {
        try {
            const data = localStorage.getItem('expense-tracker-data');
            return data ? JSON.parse(data) : [];
        } catch (error) {
            return [];
        }
    }

    // ✅ ADDED: LOAD FROM BACKEND (NO ORIGINAL CODE REMOVED)
    loadTransactionsFromBackend() {
        fetch("../backend/get_transactions.php")
            .then(res => res.json())
            .then(data => {
                if (!Array.isArray(data)) return;

                this.transactions = data.map(tx => ({
                    id: tx.id,
                    description: tx.description,
                    amount: tx.type === 'expense' ? -tx.amount : tx.amount,
                    type: tx.type,
                    date: tx.created_at
                }));

                this.updateDashboard();
                this.renderTransactions();
            })
            .catch(() => {
                // fallback already handled by localStorage
            });
    }

    // ✅ NEW: Load username from PHP session
    loadUsernameFromSession() {
        fetch("../backend/session.php")
            .then(res => res.json())
            .then(data => {
                if (data.loggedIn) {
                    document.getElementById("welcomeMessage").textContent =
                        `Welcome back, 😄 ${data.full_name}!`;
                    localStorage.setItem("userName", data.full_name); // optional
                } else {
                    window.location.href = "../frontend/login.html";
                }
            })
            .catch(err => console.error("Error fetching session:", err));
    }
}

// INITIALIZE APP
document.addEventListener('DOMContentLoaded', () => {
    // ✅ Use session-based username fetch before initializing app
    window.tracker = new ExpenseTracker();
});
