import api from "./api";

// Register user

export const registerUser = async (data) => {
  const response = await api.post("/auth/register", data);

  return response.data;
};

// Login user

export const loginUser = async (data) => {
  const response = await api.post("/auth/login", data);

  return response.data;
};

// Logout

export const logoutUser = () => {
  localStorage.removeItem("token");
};
