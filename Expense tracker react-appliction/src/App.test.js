import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Signup from './pages/Signup';
import Login from './pages/Login';
import { registerUser, loginUser } from './api/api';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('./api/api', () => ({
  registerUser: jest.fn(),
  loginUser: jest.fn(),
  getTransactions: jest.fn(),
  addTransaction: jest.fn(),
  deleteTransaction: jest.fn(),
}));

describe('Dashboard Logout Button', () => {
  beforeEach(() => {
    // Setup localStorage with user data
    localStorage.setItem('token', 'test-token-123');
    localStorage.setItem('userName', 'John Doe');
    jest.clearAllMocks();
  });

  test('should clear localStorage and redirect to login when logout button is clicked', async () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText(/Welcome, John Doe/i)).toBeInTheDocument();
    });

    // Verify localStorage before logout
    expect(localStorage.getItem('token')).toBe('test-token-123');
    expect(localStorage.getItem('userName')).toBe('John Doe');

    // Find and click the logout button
    const logoutButton = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutButton);

    // Verify localStorage is cleared after logout
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('userName')).toBeNull();

    // Verify user is redirected to login page
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});

describe('Signup Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('shows error when passwords do not match', async () => {
    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Full Name'), { target: { value: 'Alice' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'alice@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password1' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), { target: { value: 'password2' } });

    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
    });

    expect(registerUser).not.toHaveBeenCalled();
  });

  test('shows error when required fields are missing', async () => {
    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    );

    // Leave email blank
    fireEvent.change(screen.getByPlaceholderText('Full Name'), { target: { value: 'Bob' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), { target: { value: 'password' } });

    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText(/All fields are required/i)).toBeInTheDocument();
    });

    expect(registerUser).not.toHaveBeenCalled();
  });

  test('submits valid inputs and redirects on success', async () => {
    registerUser.mockResolvedValueOnce({ message: 'Registration successful' });

    jest.useFakeTimers();

    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Full Name'), { target: { value: 'Carol' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'carol@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), { target: { value: 'password' } });

    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText(/Registration successful/i)).toBeInTheDocument();
    });

    // Fast-forward the redirect timeout in the component
    jest.runAllTimers();

    expect(mockNavigate).toHaveBeenCalledWith('/');

    jest.useRealTimers();
  });
});

describe('Login Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('shows error on wrong credentials', async () => {
    loginUser.mockResolvedValueOnce({ message: 'Invalid credentials' });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'wrong@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'badpass' } });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
    });

    expect(loginUser).toHaveBeenCalledWith({ email: 'wrong@example.com', password: 'badpass' });
  });

  test('logs in with correct credentials and stores token', async () => {
    loginUser.mockResolvedValueOnce({ message: 'Login successful', token: 'token-xyz', full_name: 'Jane Doe' });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'goodpass' } });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => expect(localStorage.getItem('token')).toBe('token-xyz'));
    expect(localStorage.getItem('userName')).toBe('Jane Doe');

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });
});

describe('Dashboard Add Transaction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('token', 'dash-token');
    localStorage.setItem('userName', 'Dash User');
  });

  test('adds an income transaction, updates totals and history', async () => {
    // First load: no transactions, second load after adding: one transaction
    const tx = {
      id: 1,
      description: 'Salary',
      amount: 200,
      type: 'income',
      created_at: new Date().toISOString()
    };

    const { getTransactions, addTransaction } = require('./api/api');
    getTransactions.mockResolvedValueOnce([]).mockResolvedValueOnce([tx]);
    addTransaction.mockResolvedValueOnce({ message: 'Transaction added' });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    // Initially should show no transactions text
    await waitFor(() => expect(screen.getByText(/No transactions yet/i)).toBeInTheDocument());

    // Fill the add transaction form
    fireEvent.change(screen.getByPlaceholderText('Description'), { target: { value: 'Salary' } });
    fireEvent.change(screen.getByPlaceholderText('Amount'), { target: { value: '200' } });
    const typeSelect = screen.getByRole('combobox');
    fireEvent.change(typeSelect, { target: { value: 'income' } });

    fireEvent.click(screen.getByRole('button', { name: /add transaction/i }));

    // Wait for the new transaction to appear in the history (at least one match)
    await waitFor(() => expect(screen.queryAllByText(/Salary/i).length).toBeGreaterThan(0));

    // Totals should reflect the added income
    expect(screen.getByText(/Total Income/i).nextElementSibling.textContent).toMatch(/\$200\.00/);
    expect(screen.getByText(/Total Expense/i).nextElementSibling.textContent).toMatch(/\$0\.00/);
    expect(screen.getByText(/Total Balance/i).nextElementSibling.textContent).toMatch(/\$200\.00/);
  });
});
