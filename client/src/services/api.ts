import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const API_URL = 'http://localhost:5000/api';

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.map(cb => cb(token));
  refreshSubscribers = [];
};

const refreshToken = async () => {
  try {
    const response = await axios.post(`${API_URL}/auth/refresh`, {}, {
      withCredentials: true // to include httpOnly cookie
    });
    const { token } = response.data;
    localStorage.setItem('token', token);
    return token;
  } catch (error) {
    localStorage.removeItem('token');
    window.location.href = '/auth';
    throw error;
  }
};

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling 401 errors and token refresh
api.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // If error is 401 and we haven't tried refreshing token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If token refresh is in progress, wait for new token
        try {
          const token = await new Promise<string>(resolve => {
            subscribeTokenRefresh(resolve);
          });
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return api(originalRequest);
        } catch (err) {
          return Promise.reject(err);
        }
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const token = await refreshToken();
        originalRequest.headers['Authorization'] = `Bearer ${token}`;
        onTokenRefreshed(token);
        isRefreshing = false;
        return api(originalRequest);
      } catch (error) {
        isRefreshing = false;
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);


// Auth services
export const authService = {
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }),
  
  register: (userData: any) => 
    api.post('/auth/register', userData),
  
  verifyOtp: (email: string, otp: string) => 
    api.post('/auth/verify-otp', { email, otp }),
  
  resendOtp: (email: string) => 
    api.post('/auth/resend-otp', { email }),
  
  forgotPassword: (email: string) => 
    api.post('/auth/forgot-password', { email }),
  
  resetPassword: (token: string, password: string) => 
    api.post('/auth/reset-password', { token, password }),
};

// Profile services
export const profileService = {
  getProfile: () => 
    api.get('/profile'),
  
  updateProfile: (profileData: any) => 
    api.put('/profile', profileData),
  
  updateProfileImage: (formData: FormData) => 
    api.put('/profile/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  
  getPublicProfile: (username: string) => 
    api.get(`/profile/public/${username}`),
    
  recordProfileView: (username: string) =>
    api.post(`/profile/view/${username}`),
    
  getProfileStats: (username: string) =>
    api.get(`/profile/stats/${username}`),
    
  updateProfileVisibility: (isPublic: boolean) =>
    api.put('/profile/visibility', { isPublic }),
    
  generateProfileImage: (username: string) =>
    api.post(`/profile/generate-image/${username}`),
};

export const userInfoService = {
  createProfile: (profileData: any) => 
    api.post('/userinfo', profileData),
  
  getProfile: (userId: string) => 
    api.get(`/userinfo/${userId}`),
  
  updateProfile: (profileData: any) => 
    api.put('/userinfo', profileData),
  
  deleteProfile: () => 
    api.delete('/userinfo'),
  
  updatePartialProfile: (updates: any) => 
    api.patch('/userinfo', updates),
};

export const fetchUserProfile = async (username: string) => {
  try {
    const response = await api.get(`/profile/${username}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
};

export default api;
