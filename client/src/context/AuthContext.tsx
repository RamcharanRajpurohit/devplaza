import React, { createContext, useContext, useState, useEffect } from 'react';

interface UserData {
  id?: string;
  email?: string;
  username?: string;
  profileCompleted?:boolean;
  // Add other user properties as needed
}

interface AuthContextType {
  user: UserData | null;
  isAuthenticated: boolean;
  isProfileCompleted:boolean;
  login: (token: string, userData: UserData) => void;
  logout: () => void;
  updateUser: (userData: UserData) => void;
  setEmail: (email: string) => void;
  refreshToken: () => Promise<void>;
  isLoading: boolean; // Add loading state
  setIsProfileComplet:()=>void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isProfileCompleted, setIsProfileCompleted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Add loading state
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false); // Prevent multiple refresh calls
  const path =import.meta.env.VITE_BACKEND_URL;

  const refreshToken = async () => {
    if (isRefreshing) {
      return;
    }

    setIsRefreshing(true);
    
    try {
      const response = await fetch(path+"/api/auth/refresh-token", {
        method: "POST",
        credentials: "include", // ✅ include cookies
      });

      if (!response.ok) {
        throw new Error(`Failed to refresh token: ${response.status}`);
      }

      const data = await response.json();

      if (data.accessToken && data.email) {
        // Store new token + user
        localStorage.setItem("token", data.accessToken);
        const userData = { email: data.email }; // you can add id, username later
        localStorage.setItem("user", JSON.stringify(userData));

        setUser(userData);
        setIsAuthenticated(true);
        login(data.accessToken,data.user)

        console.log("✅ Token refreshed, user restored:", userData);
      } else {
        throw new Error("Invalid refresh response");
      }
    } catch (err) {
      console.error("❌ Refresh token failed:", err);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      if (token && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser && typeof parsedUser === 'object') {
            setUser(parsedUser);
            setIsAuthenticated(true);
            setIsLoading(false);
            console.log('✅ Restored auth state from localStorage');
            return;
          }
        } catch (error) {
          console.error('❌ Error parsing stored user data:', error);
          // Clear invalid data
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      }
      
      // Only attempt refresh if no valid stored data
      console.log('🔄 No valid stored auth, attempting token refresh...');
      await refreshToken();
    };

    initializeAuth();
  }, []); // Remove dependencies to prevent re-runs

  useEffect(() => {
    console.log('Auth State Changed:', {
      isAuthenticated,
      token: localStorage.getItem('token'),
      isLoading
    });
  }, [isAuthenticated, user, isLoading]);
  
  useEffect(() => {
    if (!isAuthenticated || isLoading) return;

    const interval = setInterval(() => {
      refreshToken();
    }, 14 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, isLoading]); // Add isLoading dependency

  const login = (token: string, userData: UserData) => {
    try {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
      setIsLoading(false);
      setIsProfileCompleted(userData?.profileCompleted ?? false)
      console.log('✅ User logged in successfully');
    } catch (error) {
      console.error('❌ Error storing auth data:', error);
    }
  };

  const setEmail = (email: string) => {
    localStorage.setItem('email',email);
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
    setIsLoading(false);
    console.log('✅ User logged out');
  };
  const setIsProfileComplet=()=>{
       setIsProfileCompleted(true);

  }
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
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      login, 
      logout, 
      updateUser,
      setEmail,
      refreshToken,
      isLoading,
      isProfileCompleted,
      setIsProfileComplet
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