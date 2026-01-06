const API_URL = "http://localhost:3000/api";

// LOGIN
export const login = async (email, password) => {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ email, password }),
  });

  return res.json();
};

// GET semua peminjaman milik user login
export const getLoans = async (token) => {
  const res = await fetch(`${API_URL}/loans`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
};

// CREATE peminjaman
export const createLoan = async (token, data) => {
  const res = await fetch(`${API_URL}/loans`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(data),
  });

  return res.json();
};

// DELETE peminjaman
export const deleteLoan = async (token, id) => {
  const res = await fetch(`${API_URL}/loans/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
};

// UPDATE status peminjaman
export const updateLoan = async (token, id, data) => {
  const res = await fetch(`${API_URL}/loans/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(data),
  });

  return res.json();
};
