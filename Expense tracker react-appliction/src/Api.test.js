import {
  loginUser,
  registerUser,
  getTransactions,
  addTransaction,
  deleteTransaction,
} from './api/api';

describe('API helper functions', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete global.fetch;
  });

  test('loginUser resolves on success and calls correct endpoint', async () => {
    const resp = { token: 'tok-123', full_name: 'Tester' };
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => resp });

    await expect(loginUser({ email: 'a@b.com', password: 'p' })).resolves.toEqual(resp);

    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/auth/login'), expect.objectContaining({ method: 'POST' }));
  });

  test('loginUser rejects with server error message', async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, json: async () => ({ message: 'Invalid credentials' }) });
    await expect(loginUser({})).rejects.toThrow('Invalid credentials');
  });

  test('registerUser resolves on success and posts to register', async () => {
    const resp = { message: 'Registration successful' };
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => resp });

    await expect(registerUser({ name: 'x' })).resolves.toEqual(resp);

    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/auth/register'), expect.objectContaining({ method: 'POST' }));
  });

  test('getTransactions sends Authorization header and returns data', async () => {
    const data = [{ id: 1 }];
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => data });

    await expect(getTransactions('tok-abc')).resolves.toEqual(data);

    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/transactions'), expect.objectContaining({ method: 'GET', headers: expect.objectContaining({ Authorization: expect.stringContaining('tok-abc') }) }));
  });

  test('addTransaction posts body and returns created item', async () => {
    const payload = { description: 'Salary', amount: 100 };
    const resp = { id: 2, ...payload };
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => resp });

    await expect(addTransaction('tok-1', payload)).resolves.toEqual(resp);

    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/transactions'), expect.objectContaining({ method: 'POST', body: JSON.stringify(payload) }));
  });

  test('deleteTransaction calls DELETE endpoint and returns response', async () => {
    const resp = { message: 'Deleted' };
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => resp });

    await expect(deleteTransaction('tok-1', 5)).resolves.toEqual(resp);

    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/transactions/5'), expect.objectContaining({ method: 'DELETE' }));
  });
});
