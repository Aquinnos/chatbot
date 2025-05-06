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
  apiKey?: string;
}

interface UpdateProfileParams {
  username?: string;
  email?: string;
  password?: string;
  currentPassword?: string;
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
      const errorData = await response
        .json()
        .catch(() => ({ message: 'Registration failed' }));
      throw new Error(errorData.message || 'Registration failed');
    }
    return;
  },

  // Login a user
  login: async (data: LoginParams): Promise<User> => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include', // Include cookies in the request
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: `Server error: ${response.status}` }));
        throw new Error(
          errorData.message || `Login failed with status: ${response.status}`
        );
      }

      const userData = await response.json().catch(() => {
        throw new Error('Invalid response from server');
      });

      if (!userData || !userData.token) {
        throw new Error('Invalid user data received from server');
      }

      // Debug: Log the user data received from login response
      console.log(
        'Login response received:',
        JSON.stringify(userData, null, 2)
      );
      console.log('API Key in login response:', userData.apiKey);

      // WAŻNE: Najpierw usuwamy poprzednie dane z localStorage, żeby nie mieszać danych między użytkownikami
      localStorage.removeItem('user_glhf_api_key');

      // Store authentication data in both cookie and localStorage
      // Cookie will be used by middleware for server-side auth checks
      // localStorage will be used for client-side checks
      setCookie('token', userData.token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', userData.token);

      // Store API key from login response if it exists
      if (userData.apiKey) {
        console.log('Setting API key in localStorage:', userData.apiKey);
        localStorage.setItem('user_glhf_api_key', userData.apiKey);
      } else {
        console.log('No API key found in login response');
      }

      // After successful login, get the complete user profile to have access to apiKey
      // This is just a backup in case the login response doesn't include the apiKey
      try {
        console.log('Fetching complete profile after login...');
        const profileResponse = await fetch(`${API_BASE_URL}/users`, {
          headers: {
            Authorization: `Bearer ${userData.token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          console.log(
            'Profile data received:',
            JSON.stringify(profileData, null, 2)
          );
          console.log('API Key in profile:', profileData.apiKey);

          // If user has an API key stored in their profile, use it locally
          if (profileData.apiKey) {
            // Save to localStorage for API usage
            console.log(
              'Setting API key from profile to localStorage:',
              profileData.apiKey
            );
            localStorage.setItem('user_glhf_api_key', profileData.apiKey);

            // Update the userData with the apiKey value
            userData.apiKey = profileData.apiKey;
            localStorage.setItem('user', JSON.stringify(userData));
          } else {
            console.log('No API key found in profile response');
            // Usuwamy kod, który automatycznie synchronizował lokalny klucz API do serwera
            // To jest źródło problemu z "przeskakiwaniem" kluczy między użytkownikami
          }
        }
      } catch (error) {
        console.error('Error fetching complete profile after login:', error);
      }

      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Logout the current user
  logout: (): void => {
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('user_glhf_api_key');
  },

  getCurrentUser: (): User | null => {
    const userJson = localStorage.getItem('user');
    if (!userJson) return null;
    return JSON.parse(userJson);
  },

  getToken: (): string | null => {
    // Try from cookie first, then localStorage
    return getCookie('token') || localStorage.getItem('token');
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!getCookie('token') || !!localStorage.getItem('token');
  },

  // Update user profile
  updateProfile: async (data: UpdateProfileParams): Promise<User> => {
    const response = await authApi.authenticatedRequest('/users', {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    // Update the stored user data with new information
    const currentUserData = authApi.getCurrentUser();
    if (currentUserData) {
      const updatedUserData = {
        ...currentUserData,
        username: data.username || currentUserData.username,
        email: data.email || currentUserData.email,
      };
      localStorage.setItem('user', JSON.stringify(updatedUserData));
    }

    return response;
  },

  // Update user's API key
  updateApiKey: async (apiKey: string): Promise<User> => {
    const response = await authApi.authenticatedRequest('/api-key', {
      method: 'PUT',
      body: JSON.stringify({ apiKey }),
    });

    // Update the stored user data with new API key
    const currentUserData = authApi.getCurrentUser();
    if (currentUserData) {
      const updatedUserData = {
        ...currentUserData,
        apiKey,
      };
      localStorage.setItem('user', JSON.stringify(updatedUserData));
    }

    return response;
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
