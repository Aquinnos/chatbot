// API service for handling all API requests
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

interface RegisterParams {
  username: string;
  email: string;
  password: string;
}

interface LoginParams {
  email: string;
  password: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  token?: string;
}

// Helper to set a cookie
const setCookie = (name: string, value: string, days = 7) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; expires=${expires}; path=/; secure; samesite=strict`;
};

// Helper to get a cookie value
const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2)
    return decodeURIComponent(parts.pop()?.split(';').shift() || '');
  return null;
};

// Authentication API calls
export const authApi = {
  // Register a new user
  register: async (data: RegisterParams): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include', // Include cookies in the request
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }

    return response.json();
  },

  // Login a user
  login: async (data: LoginParams): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include', // Include cookies in the request
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    const userData = await response.json();

    // Store authentication data in both cookie and localStorage
    // Cookie will be used by middleware for server-side auth checks
    // localStorage will be used for client-side checks
    setCookie('token', userData.token);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userData.token);

    return userData;
  },

  // Logout the current user
  logout: (): void => {
    // Remove token from both cookie and localStorage
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  },

  // Get current authenticated user
  getCurrentUser: (): User | null => {
    const userJson = localStorage.getItem('user');
    if (!userJson) return null;
    return JSON.parse(userJson);
  },

  // Get authentication token
  getToken: (): string | null => {
    // Try from cookie first, then localStorage
    return getCookie('token') || localStorage.getItem('token');
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!getCookie('token') || !!localStorage.getItem('token');
  },

  // Make an authenticated API request
  authenticatedRequest: async (url: string, options: RequestInit = {}) => {
    const token = authApi.getToken();

    const authOptions = {
      ...options,
      headers: {
        ...options.headers,
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
      credentials: 'include' as RequestCredentials,
    };

    const response = await fetch(`${API_BASE_URL}${url}`, authOptions);

    // Handle token expiration
    if (response.status === 401) {
      authApi.logout();
      // Redirect to login page
      window.location.href = '/auth/login';
      throw new Error('Your session has expired. Please log in again.');
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'API request failed');
    }

    return response.json();
  },
};
