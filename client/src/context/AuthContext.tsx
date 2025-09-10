import React, { createContext, useContext, useState, useEffect } from 'react';

interface UserData {
  id?: string;
  email?: string;
  username?: string;
  hasProfile?: boolean;
  // Add other user properties as needed
}

export interface AuthContextType {
  user: UserData | null;
  accessToken?: string | null;
  isAuthenticated: boolean;
  login: (token: string, userData: UserData) => void;
  logout: () => void;
  updateUser: (userData: UserData) => void;
  setEmail: (email: string) => void;
  refreshToken: () => Promise<void>;
  setAccessToken: (token: string) => void;
  isLoading: boolean;
  setHasProfile: (hasProfile: boolean) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
 
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [accessToken, setAccessToken] = useState<string | null>(null); // Token stored in memory
  const [hasProfile, setHasProfile] = useState<boolean>(false);

  const refreshToken = async () => {
    // Prevent multiple simultaneous refresh attempts
    if (isRefreshing) {
      return;
    }

    setIsRefreshing(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/refresh-token", {
        method: "POST",
        credentials: "include", // ✅ include cookies (httpOnly refresh token)
      });

      if (!response.ok) {
        throw new Error(`Failed to refresh token: ${response.status}`);
      }

      const data = await response.json();

      if (data.accessToken && data.user) {
        setAccessToken(data.accessToken);

        // Store full user object instead of just email
        localStorage.setItem("user", JSON.stringify(data.user));

        setUser(data.user);
        setIsAuthenticated(true);

        console.log("✅ Token refreshed, user restored:", data.user);
      } else {
        throw new Error("Invalid refresh response");
      }

    } catch (err) {
      console.error("❌ Refresh token failed:", err);
      // Clear any existing auth data
      setAccessToken(null);
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Check for stored user data on mount and attempt token refresh
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem('user');

      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser && typeof parsedUser === 'object') {
            // We have user data, attempt to refresh token
            console.log('🔄 Found stored user, attempting token refresh...');
            await refreshToken();
            return;
          }
        } catch (error) {
          console.error('❌ Error parsing stored user data:', error);
          localStorage.removeItem('user');
        }
      }

      // No stored user data, attempt refresh anyway (in case refresh token cookie exists)
      console.log('🔄 No stored user, attempting token refresh...');
      await refreshToken();
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    console.log('Auth State Changed:', {
      isAuthenticated,
      hasToken: !!accessToken,
      isLoading
    });
  }, [isAuthenticated, user, isLoading, accessToken]);

  useEffect(() => {
    if (!isAuthenticated || isLoading) return;

    const interval = setInterval(() => {
      refreshToken();
    }, 14 * 60 * 1000); // Refresh every 14 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated, isLoading]);

  const login = (token: string, userData: UserData) => {
    try {
      // Store token in memory and user data in localStorage
      setAccessToken(token);
      localStorage.setItem('user', JSON.stringify(userData));


      setUser(userData);
      setIsAuthenticated(true);
      setIsLoading(false);
      console.log('✅ User logged in successfully');
    } catch (error) {
      console.error('❌ Error storing auth data:', error);
    }
  };

  const setEmail = (email: string) => {
    if (user) {
      const updatedUser = { ...user, email };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      console.log('✅ User email updated');
    }
  };

  const logout = () => {
    setAccessToken(null); // Clear token from memory
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    setIsLoading(false);
    console.log('✅ User logged out');
  };

  const updateUser = (userData: UserData) => {
    try {
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      console.log('✅ User data updated');
    } catch (error) {
      console.error('❌ Error updating user data:', error);
    }
  };

  const updateAccessToken = (token: string) => {
    setAccessToken(token);
    console.log('✅ Access token updated');
  };

  return (
    <AuthContext.Provider value={{
      user,
      setHasProfile,
      accessToken,
      isAuthenticated,
      login,
      logout,
      updateUser,
      setEmail,
      refreshToken,
      setAccessToken: updateAccessToken,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};