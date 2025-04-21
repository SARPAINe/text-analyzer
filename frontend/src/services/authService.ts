import axios from "axios";
import { apiClient } from "./apiClient";

// Register new user
export const register = async (email: string, password: string) => {
  try {
    const response = await apiClient.post("/api/v1/auth/register", {
      email,
      password,
    });
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || "Registration failed");
    }
    throw new Error("Network error during registration");
  }
};

// Login user
export const login = async (email: string, password: string) => {
  try {
    const response = await apiClient.post("/api/v1/auth/login", {
      email,
      password,
    });
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || "Login failed");
    }
    throw new Error("Network error during login");
  }
};

// Logout user
export const logout = async () => {
  try {
    await apiClient.post("/api/v1/auth/logout");
  } catch (error) {
    console.error("Logout error:", error);
    throw new Error("Logout failed");
  }
};

// Get user profile
export const getProfile = async () => {
  try {
    // This endpoint isn't mentioned in the routes, assuming it exists or we use the JWT to get user info
    // Since we don't have a profile endpoint in the provided routes, we'll return a mock user for now
    // In a real app, you'd make a request to get the user profile
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No authentication token");

    // Parse JWT payload (this is a simplification, not for production)
    const payload = JSON.parse(atob(token.split(".")[1]));
    return {
      id: payload.id,
      email: payload.email,
    };
  } catch (error) {
    console.error("Get profile error:", error);
    throw new Error("Failed to get user profile");
  }
};

// Initiate Google OAuth login
export const initiateGoogleLogin = () => {
  window.location.href = "/api/v1/auth/login/federated/google";
};
