import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    getTransactions,
    addTransaction,
    deleteTransaction
} from '../api/api';
import '../styles/dashboard.css';

function Dashboard() {
    const [transactions, setTransactions] = useState([]);
    const [user, setUser] = useState({});
    const [form, setForm] = useState({
        description: '',
        amount: '',
        type: 'expense'
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');

    const navigate = useNavigate();

    /* =========================
       AUTH + INITIAL LOAD
    ========================== */
    useEffect(() => {
        const token = localStorage.getItem('token');
        const userName = localStorage.getItem('userName');

        if (!token) {
            navigate('/');
            return;
        }

        setUser({ full_name: userName });
        loadTransactions(token);
    }, [navigate]);

    /* =========================
       LOAD TRANSACTIONS
    ========================== */
    const loadTransactions = async (token) => {
        try {
            setLoading(true);
            const res = await getTransactions(token);

            if (Array.isArray(res)) {
                setTransactions(res);
            } else if (res && res.data) {
                setTransactions(Array.isArray(res.data) ? res.data : []);
            }

            setError('');
        } catch (err) {
            console.error(err);
            setError('Failed to load transactions');
        } finally {
            setLoading(false);
        }
    };

    /* =========================
       FORM HANDLING
    ========================== */
    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        if (!form.description || !form.amount || !form.type) {
            setError('All fields are required');
            return;
        }

        try {
            const res = await addTransaction(token, {
                description: form.description,
                amount: parseFloat(form.amount),
                type: form.type
            });

            if (res.message === 'Transaction added' || res === 'success') {
                loadTransactions(token);
                setForm({ description: '', amount: '', type: 'expense' });
                setError('');
            } else {
                setError(res.error || 'Failed to add transaction');
            }
        } catch (err) {
            console.error(err);
            setError('Server error. Please check backend.');
        }
    };

    /* =========================
       DELETE TRANSACTION
    ========================== */
    const handleDelete = async (id) => {
        const token = localStorage.getItem('token');

        try {
            const res = await deleteTransaction(token, id);

            if (res.message === 'Transaction deleted' || res === 'success') {
                loadTransactions(token);
            } else {
                setError(res.error || 'Failed to delete transaction');
            }
        } catch (err) {
            console.error(err);
            setError('Server error');
        }
    };

    /* =========================
       LOGOUT
    ========================== */
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        navigate('/');
    };

    /* =========================
       DARK MODE TOGGLE
    ========================== */
    const handleDarkModeToggle = () => {
        setDarkMode(!darkMode);
        localStorage.setItem('darkMode', !darkMode);
    };

    /* =========================
       CALCULATIONS
    ========================== */
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const totalBalance = totalIncome - totalExpense;

    /* =========================
       RENDER
    ========================== */
    return (
        <div className={`dashboard ${darkMode ? 'dark-mode' : 'light-mode'}`}>
            {/* HEADER */}
            <header className="dashboard-header">
                <div className="header-top">
                    <h1 className="app-title">KEEP-UP</h1>
                </div>

                <div className="header-bottom">
                    <p className="welcome-text bounce">
                        Welcome, {user.full_name} 😊
                    </p>

                    <div className="header-actions">
                        <button
                            onClick={handleLogout}
                            className="logout-btn"
                        >
                            Logout
                        </button>

                        <button
                            onClick={handleDarkModeToggle}
                            className="dark-mode-btn"
                            title={darkMode ? 'Light Mode' : 'Dark Mode'}
                        >
                            {darkMode ? '☀️' : '🌙'}
                        </button>
                    </div>
                </div>
            </header>

            {/* CONTENT */}
            <div className="dashboard-container">

                {/* SUMMARY */}
                <div className="summary">
                    <div className="summary-card balance">
                        <h3>Total Balance</h3>
                        <p>${totalBalance.toFixed(2)}</p>
                    </div>

                    <div className="summary-card income">
                        <h3>Total Income</h3>
                        <p>${totalIncome.toFixed(2)}</p>
                    </div>

                    <div className="summary-card expense">
                        <h3>Total Expense</h3>
                        <p>${totalExpense.toFixed(2)}</p>
                    </div>
                </div>

                {/* ADD TRANSACTION */}
                <div className="add-transaction">
                    <h2>Add Transaction</h2>
                    {error && <p style={{ color: 'red' }}>{error}</p>}

                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            name="description"
                            placeholder="Description"
                            value={form.description}
                            onChange={handleChange}
                        />

                        <input
                            type="number"
                            name="amount"
                            placeholder="Amount"
                            step="0.01"
                            value={form.amount}
                            onChange={handleChange}
                        />

                        <select
                            name="type"
                            value={form.type}
                            onChange={handleChange}
                        >
                            <option value="expense">Expense</option>
                            <option value="income">Income</option>
                        </select>

                        <button type="submit">
                            Add Transaction
                        </button>
                    </form>
                </div>

                {/* TRANSACTIONS */}
                <div className="transactions">
                    <h2>Transaction History</h2>

                    {loading ? (
                        <p>Loading transactions...</p>
                    ) : transactions.length === 0 ? (
                        <p>No transactions yet</p>
                    ) : (
                        <>
                            {/* DESKTOP TABLE */}
                            <table className="desktop-table">
                                <thead>
                                    <tr>
                                        <th>Description</th>
                                        <th>Amount</th>
                                        <th>Type</th>
                                        <th>Date</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map(tx => (
                                        <tr key={tx.id}>
                                            <td>{tx.description || '-'}</td>
                                            <td>${(Number(tx.amount) || 0).toFixed(2)}</td>
                                            <td>
                                                <span className={`type ${tx.type}`}>
                                                    {tx.type || 'unknown'}
                                                </span>
                                            </td>
                                            <td>
                                                {tx.created_at ? new Date(tx.created_at).toLocaleDateString() : '-'}
                                            </td>
                                            <td>
                                                <button
                                                    onClick={() => handleDelete(tx.id)}
                                                    className="delete-btn"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* MOBILE VIEW */}
                            <div className="mobile-transactions">
                                {transactions.map(tx => (
                                    <div key={tx.id} className="transaction-card">
                                        <p><strong>Description:</strong> {tx.description || '-'}</p>
                                        <p><strong>Amount:</strong> ${(Number(tx.amount) || 0).toFixed(2)}</p>
                                        <p>
                                            <strong>Type:</strong>
                                            <span className={`type ${tx.type}`}>
                                                {tx.type || 'unknown'}
                                            </span>
                                        </p>
                                        <p>
                                            <strong>Date:</strong>
                                            {tx.created_at ? new Date(tx.created_at).toLocaleDateString() : '-'}
                                        </p>
                                        <button
                                            onClick={() => handleDelete(tx.id)}
                                            className="delete-btn"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
