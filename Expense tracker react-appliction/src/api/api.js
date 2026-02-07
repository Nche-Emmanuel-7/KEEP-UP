const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

// Helper to handle HTTP errors gracefully
const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || `HTTP ${res.status}`);
  }
  return data;
};

export async function loginUser(data) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

export async function registerUser(data) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  } catch (error) {
    console.error("Register error:", error);
    throw error;
  }
}

export async function getTransactions(token) {
  try {
    const res = await fetch(`${API_BASE_URL}/transactions`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse(res);
  } catch (error) {
    console.error("Get transactions error:", error);
    throw error;
  }
}

export async function addTransaction(token, data) {
  try {
    const res = await fetch(`${API_BASE_URL}/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  } catch (error) {
    console.error("Add transaction error:", error);
    throw error;
  }
}

export async function deleteTransaction(token, id) {
  try {
    const res = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse(res);
  } catch (error) {
    console.error("Delete transaction error:", error);
    throw error;
  }
}
