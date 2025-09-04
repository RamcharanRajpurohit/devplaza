import React, { createContext, useContext, useState, useEffect } from 'react';

interface UserData {
  id?: string;
  email?: string;
  username?: string;
  // Add other user properties as needed
}

interface AuthContextType {
  user: UserData | null;
  isAuthenticated: boolean;
  login: (token: string, userData: UserData) => void;
  logout: () => void;
  updateUser: (userData: UserData) => void;
  setEmail: (email: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const refreshToken = async () => {
  try {
    const response = await fetch("http://localhost:5000/api/auth/refresh-token", {
      method: "POST",
      credentials: "include", // ✅ include cookies
    });

    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }

    const data = await response.json();

    if (data.accessToken && data.email) {
      // Store new token + user
      localStorage.setItem("token", data.accessToken);
      const userData = { email: data.email }; // you can add id, username later
      localStorage.setItem("user", JSON.stringify(userData));

      setUser(userData);
      setIsAuthenticated(true);

      console.log("✅ Token refreshed, user restored:", userData);
    } else {
      throw new Error("Invalid refresh response");
    }
  } catch (err) {
    console.error("❌ Refresh token failed:", err);
    logout();
  }
};

  useEffect(() => {
    // Check for stored token and user data on mount
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && typeof parsedUser === 'object') {
          setUser(parsedUser);
          setIsAuthenticated(true);
          console.log('✅ Restored auth state from localStorage');
        }
      } catch (error) {
        console.error('❌ Error parsing stored user data:', error);
        // Clear invalid data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    else {
      // Attempt to refresh token if no valid token found
      refreshToken();
    }
  }, []);

  useEffect(() => {
    console.log('Auth State Changed:', {
      isAuthenticated,
      token: localStorage.getItem('token')
    });
  }, [isAuthenticated, user]);
  
  useEffect(() => {
  if (!isAuthenticated) return;

  const interval = setInterval(() => {
    refreshToken();
  }, 14 * 60 * 1000);

  return () => clearInterval(interval);
}, [isAuthenticated]);

  const login = (token: string, userData: UserData) => {
    try {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
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
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
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

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, updateUser,setEmail}}>
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
