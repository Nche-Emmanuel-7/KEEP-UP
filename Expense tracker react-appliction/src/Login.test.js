import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from './pages/Login';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock API
jest.mock('./api/api', () => ({
  loginUser: jest.fn(),
}));

describe('Login Page (separate file)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('shows error on wrong credentials', async () => {
    const api = require('./api/api');
    api.loginUser.mockResolvedValueOnce({ message: 'Invalid credentials' });

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

    expect(api.loginUser).toHaveBeenCalledWith({ email: 'wrong@example.com', password: 'badpass' });
  });

  test('logs in with correct credentials and stores token', async () => {
    const api = require('./api/api');
    api.loginUser.mockResolvedValueOnce({ message: 'Login successful', token: 'token-xyz', full_name: 'Jane Doe' });

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
