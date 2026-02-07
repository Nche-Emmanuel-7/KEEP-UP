import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Signup from './pages/Signup';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock API
jest.mock('./api/api', () => ({
  registerUser: jest.fn(),
}));

describe('Signup Page (separate file)', () => {
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

    const api = require('./api/api');
    expect(api.registerUser).not.toHaveBeenCalled();
  });

  test('shows error when required fields are missing', async () => {
    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Full Name'), { target: { value: 'Bob' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), { target: { value: 'password' } });

    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText(/All fields are required/i)).toBeInTheDocument();
    });

    const api = require('./api/api');
    expect(api.registerUser).not.toHaveBeenCalled();
  });

  test('submits valid inputs and redirects on success', async () => {
    const api = require('./api/api');
    api.registerUser.mockResolvedValueOnce({ message: 'Registration successful' });

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

    jest.runAllTimers();

    expect(mockNavigate).toHaveBeenCalledWith('/');

    jest.useRealTimers();
  });
});
