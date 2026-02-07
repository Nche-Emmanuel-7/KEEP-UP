import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import { getTransactions, addTransaction } from './api/api';

// Mock navigation
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock API
jest.mock('./api/api', () => ({
  getTransactions: jest.fn(),
  addTransaction: jest.fn(),
  deleteTransaction: jest.fn(),
}));

describe('Dashboard - Add Transaction Calculation', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('userName', 'John Doe');
    jest.clearAllMocks();
  });

  test('adds income transaction and updates total balance', async () => {
    // Initial load → no transactions
    getTransactions.mockResolvedValueOnce([]);

    // After adding transaction → backend returns updated list
    getTransactions.mockResolvedValueOnce([
      {
        id: 1,
        description: 'Salary',
        amount: 5000,
        type: 'income',
      },
    ]);

    addTransaction.mockResolvedValueOnce({ message: 'Transaction added' });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    // Wait for dashboard welcome text
    await waitFor(() => {
      expect(screen.getByText(/Welcome, John Doe/i)).toBeInTheDocument();
    });

    // Fill form
    fireEvent.change(screen.getByPlaceholderText('Description'), {
      target: { value: 'Salary' },
    });

    fireEvent.change(screen.getByPlaceholderText('Amount'), {
      target: { value: '5000' },
    });

    fireEvent.change(screen.getByDisplayValue('Expense'), {
      target: { value: 'income' },
    });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /add transaction/i }));

    // Check TOTAL BALANCE calculation (allow multiple matching nodes)
    await waitFor(() => expect(screen.queryAllByText('$5000.00').length).toBeGreaterThan(0));
  });
});
