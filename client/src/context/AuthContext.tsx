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
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

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
  }, []);

  useEffect(() => {
    console.log('Auth State Changed:', {
      isAuthenticated,
      token: localStorage.getItem('token')
    });
  }, [isAuthenticated, user]);

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
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, updateUser }}>
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
