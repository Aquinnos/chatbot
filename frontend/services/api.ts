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
  register: async (data: RegisterParams): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include',
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
        credentials: 'include',
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

      console.log(
        'Login response received:',
        JSON.stringify(userData, null, 2)
      );
      console.log('API Key in login response:', userData.apiKey);


      if (userData.apiKey) {
        localStorage.removeItem('user_glhf_api_key');
      }

      setCookie('token', userData.token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', userData.token);

      if (userData.apiKey) {
        console.log('Setting API key in localStorage:', userData.apiKey);
        localStorage.setItem('user_glhf_api_key', userData.apiKey);
      } else {
        console.log('No API key found in login response');
      }

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

          if (profileData.apiKey) {
            console.log(
              'Setting API key from profile to localStorage:',
              profileData.apiKey
            );
            localStorage.setItem('user_glhf_api_key', profileData.apiKey);

            userData.apiKey = profileData.apiKey;
            localStorage.setItem('user', JSON.stringify(userData));
          } else {
            console.log('No API key found in profile response');
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
    return getCookie('token') || localStorage.getItem('token');
  },

  isAuthenticated: (): boolean => {
    return !!getCookie('token') || !!localStorage.getItem('token');
  },

  updateProfile: async (data: UpdateProfileParams): Promise<User> => {
    const response = await authApi.authenticatedRequest('/users', {
      method: 'PUT',
      body: JSON.stringify(data),
    });

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

  updateApiKey: async (apiKey: string): Promise<User> => {
    const response = await authApi.authenticatedRequest('/api-key', {
      method: 'PUT',
      body: JSON.stringify({ apiKey }),
    });

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

    if (response.status === 401) {
      authApi.logout();
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
