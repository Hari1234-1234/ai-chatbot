import axiosInstance from "./axiosInstance";

// Register a new user.
export const registerUser = async (userData) => {
  const response = await axiosInstance.post("/auth/register", userData);

  return response.data;
};

// Login an existing user.
export const loginUser = async (loginData) => {
  const response = await axiosInstance.post("/auth/login", loginData);

  return response.data;
};

// Get the logged-in user's profile.
export const getUserProfile = async () => {
  const response = await axiosInstance.get("/auth/profile");

  return response.data;
};
