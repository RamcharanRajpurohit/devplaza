import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  User, 
  Mail, 
  Lock, 
  Trash2, 
  Save, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle,
  Shield,
  RefreshCw
} from 'lucide-react';

const API = "http://localhost:5000"; // Your API base URL

interface UserInfo {
  _id?: string;
  fullName?: string;
  bio?: string;
  location?: string;
  links?: {
    github?: string;
    gfg?: string;
    leetcode?: string;
    codechef?: string;
    code360?: string;
    codeforces?: string;
  };
  skills?: string[];
  experience?: {
    years?: number;
    currentRole?: string;
    company?: string;
  };
  user?: {
    _id: string;
    username: string;
    email: string;
  };
}

interface User {
  _id: string;
  username: string;
  email: string;
  emailVerified?: boolean;
}

const Settings: React.FC = () => {
  // Get updateUser from AuthContext
  const { refreshToken, updateUser } = useAuth();
  
  // User state
  const [user, setUser] = useState<User | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo>({});
  
  // Form states
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setInitialLoading(true);
    try {
      await Promise.all([fetchCurrentUser(), fetchUserInfo()]);
    } catch (err) {
      console.error('Error fetching initial data:', err);
      setError('Failed to load user data');
    } finally {
      setInitialLoading(false);
    }
  };

  const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
    const makeRequest = async (headers: Record<string, string>) => {
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          ...headers
        }
      });
    };

    // First attempt with current token
    let response = await makeRequest(getAuthHeaders());
    
    // If 401, try to refresh token and retry
    if (response.status === 401) {
      console.log('🔄 Token expired, attempting refresh...');
      try {
        await refreshToken();
        // Retry with new token
        response = await makeRequest(getAuthHeaders());
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);
        window.location.href = '/auth/login';
        throw refreshError;
      }
    }

    return response;
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await makeAuthenticatedRequest(`${API}/api/auth/me`);
      
      const data = await response.json();
      if (data.success) {
        setUser(data.data);
        setNewUsername(data.data.username || '');
        setNewEmail(data.data.email || '');
      } else {
        // If still unauthorized after refresh attempt, redirect to login
        if (response.status === 401) {
          console.log('Unauthorized, redirecting to login');
          window.location.href = '/auth/login';
        }
      }
    } catch (err) {
      console.error('Error fetching current user:', err);
    }
  };

  const fetchUserInfo = async () => {
    try {
      const response = await makeAuthenticatedRequest(`${API}/api/user-info`);
      
      const data = await response.json();
      if (data.success) {
        // Normalize skills to array
        const normalizeSkillsToArray = (val: any) => {
          if (Array.isArray(val)) return val;
          if (typeof val === 'string') {
            return val.split(',').map((s: string) => s.trim()).filter((s: string) => s);
          }
          return [];
        };

        setUserInfo({
          ...data.data,
          skills: normalizeSkillsToArray(data.data.skills),
          // Keep links as object structure for individual platform handling
          links: data.data.links || {}
        });
      }
    } catch (err) {
      console.error('Error fetching user info:', err);
    }
  };

  const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('token');
    console.log('Retrieved token for auth headers:', token);
    if (!token) {
      console.log('No token found, redirecting to login');
      window.location.href = '/auth/login';
      return { 'Authorization': '', 'Content-Type': 'application/json' };
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const clearMessages = () => {
    setError('');
    setMessage('');
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    clearMessages();

    try {
      console.log('🔄 Updating user profile');
      const response = await makeAuthenticatedRequest(`${API}/api/user-info`, {
        method: 'PUT',
        body: JSON.stringify(userInfo)
      });

      const data = await response.json();
      if (data.success) {
        setUserInfo(data.data);
        setMessage('Profile updated successfully!');
        console.log('✅ Profile updated successfully');
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (err: any) {
      console.error('❌ Profile update error:', err);
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeUsername = async () => {
    if (!newUsername.trim()) {
      setError('Username cannot be empty');
      return;
    }

    if (newUsername.trim().length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }

    setLoading(true);
    clearMessages();

    try {
      console.log('🔄 Updating username to:', newUsername);
      const response = await makeAuthenticatedRequest(`${API}/api/auth/update-username`, {
        method: 'PATCH',
        body: JSON.stringify({ username: newUsername.trim() })
      });

      const data = await response.json();
      if (data.success) {
        setUser(data.data);
        // Update AuthContext with new username
        updateUser({
          ...data.data,
          username: data.data.username,
        });
        setMessage('Username updated successfully!');
        console.log('✅ Username updated successfully');
      } else {
        setError(data.message || 'Failed to update username');
      }
    } catch (err: any) {
      console.error('❌ Username update error:', err);
      setError('Failed to update username');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEmail = async () => {
    if (!newEmail.trim()) {
      setError('Email cannot be empty');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    clearMessages();

    try {
      console.log('🔄 Updating email to:', newEmail);
      const response = await makeAuthenticatedRequest(`${API}/api/auth/update-email`, {
        method: 'PATCH',
        body: JSON.stringify({ email: newEmail.trim() })
      });

      const data = await response.json();
      if (data.success) {
        setUser(data.data);
        // Update AuthContext with new email
        updateUser({
          ...data.data,
          email: data.data.email,
        });
        setMessage('Email updated successfully! Please verify your new email.');
        console.log('✅ Email updated successfully');
      } else {
        setError(data.message || 'Failed to update email');
      }
    } catch (err: any) {
      console.error('❌ Email update error:', err);
      setError('Failed to update email');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    console.log('⚡ Password change initiated');
    console.log('Current Password:', currentPassword ? '✓ Provided' : '✗ Empty');
    console.log('New Password:', newPassword ? '✓ Provided' : '✗ Empty');
    console.log('Confirm Password:', confirmPassword ? '✓ Provided' : '✗ Empty');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All password fields are required');
      console.log('❌ Validation failed: Empty fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      console.log('❌ Validation failed: Passwords don\'t match');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      console.log('❌ Validation failed: Password too short');
      return;
    }

    setLoading(true);
    clearMessages();

    try {
      console.log('🔄 Sending password change request to:', `${API}/api/auth/change-password`);
      
      const requestData = {
        currentPassword,
        newPassword
      };
      
      console.log('📦 Request payload:', JSON.stringify(requestData));

      const response = await makeAuthenticatedRequest(`${API}/api/auth/change-password`, {
        method: 'PATCH',
        body: JSON.stringify(requestData)
      });

      const data = await response.json();
      console.log('📨 Server response:', data);

      if (data.success) {
        setMessage('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        console.log('✅ Password changed successfully');
      } else {
        setError(data.message || 'Failed to change password');
        console.log('❌ Password change failed:', data.message);
      }
    } catch (err: any) {
      console.error('❌ Password change error:', err);
      setError('Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!user?.email) {
      setError('User email not found');
      return;
    }

    setLoading(true);
    clearMessages();

    try {
      console.log('🔄 Sending forgot password request');
      const response = await fetch(`${API}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email })
      });

      const data = await response.json();
      if (data.success) {
        setMessage('Password reset code sent to your email!');
        console.log('✅ Forgot password email sent');
      } else {
        setError(data.message || 'Failed to send reset email');
      }
    } catch (err: any) {
      console.error('❌ Forgot password error:', err);
      setError('Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setError('Please type "DELETE" to confirm account deletion');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('🔄 Deleting user account');
      const response = await makeAuthenticatedRequest(`${API}/api/auth/delete-account`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success) {        
        console.log('✅ Account deleted successfully');
        // Clear AuthContext on account deletion
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth/login';
      } else {
        setError(data.message || 'Failed to delete account');
      }
    } catch (err: any) {
      console.error('❌ Account deletion error:', err);
      setError('Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkChange = (platform: string, value: string) => {
    setUserInfo(prev => ({
      ...prev,
      links: {
        ...prev.links,
        [platform]: value
      }
    }));
  };

  const handleExperienceChange = (field: string, value: string | number) => {
    setUserInfo(prev => ({
      ...prev,
      experience: {
        ...prev.experience,
        [field]: value
      }
    }));
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'account', label: 'Account', icon: Shield },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'danger', label: 'Danger Zone', icon: AlertCircle }
  ];

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-red-400 mx-auto mb-4" />
              <p className="text-gray-400">Loading your settings...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-4" />
              <p className="text-gray-400">Failed to load user data. Please try refreshing the page.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-gray-400 mt-2">Manage your account settings and preferences</p>
        </div>

        {/* Messages */}
        {message && (
          <div className="mb-6 bg-green-900/50 border border-green-800 text-green-200 px-4 py-2 rounded-lg flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-900/50 border border-red-800 text-red-200 px-4 py-2 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-gray-900 via-red-950 to-black border border-red-900/30 rounded-lg p-4">
              <nav className="space-y-2">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        clearMessages();
                      }}
                      className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-red-900/30 text-red-300 border border-red-800'
                          : 'text-gray-400 hover:text-red-300 hover:bg-red-900/20'
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-gradient-to-br from-gray-900 via-red-950 to-black border border-red-900/30 rounded-lg p-6">
              
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-xl font-semibold text-red-300 mb-6">Profile Information</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={userInfo.fullName || ''}
                          onChange={(e) => setUserInfo({...userInfo, fullName: e.target.value})}
                          className="w-full p-3 bg-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-red-600 focus:outline-none text-black"
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Location
                        </label>
                        <input
                          type="text"
                          value={userInfo.location || ''}
                          onChange={(e) => setUserInfo({...userInfo, location: e.target.value})}
                          className="w-full p-3 bg-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-red-600 focus:outline-none text-black"
                          placeholder="Your location"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Bio
                      </label>
                      <textarea
                        value={userInfo.bio || ''}
                        onChange={(e) => setUserInfo({...userInfo, bio: e.target.value})}
                        className="w-full p-3 bg-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-red-600 focus:outline-none h-32 resize-none text-black"
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    {/* Experience Section */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Experience
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Years of Experience</label>
                          <input
                            type="number"
                            value={userInfo.experience?.years || ''}
                            onChange={(e) => handleExperienceChange('years', parseInt(e.target.value) || 0)}
                            className="w-full p-2 bg-white rounded border border-gray-700 focus:ring-2 focus:ring-red-600 focus:outline-none text-black text-sm"
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Current Role</label>
                          <input
                            type="text"
                            value={userInfo.experience?.currentRole || ''}
                            onChange={(e) => handleExperienceChange('currentRole', e.target.value)}
                            className="w-full p-2 bg-white rounded border border-gray-700 focus:ring-2 focus:ring-red-600 focus:outline-none text-black text-sm"
                            placeholder="Student, Developer, etc."
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Company/Institution</label>
                          <input
                            type="text"
                            value={userInfo.experience?.company || ''}
                            onChange={(e) => handleExperienceChange('company', e.target.value)}
                            className="w-full p-2 bg-white rounded border border-gray-700 focus:ring-2 focus:ring-red-600 focus:outline-none text-black text-sm"
                            placeholder="Company or institution name"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Skills (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={Array.isArray(userInfo.skills) ? userInfo.skills.join(', ') : ''}
                        onChange={(e) => setUserInfo({
                          ...userInfo, 
                          skills: e.target.value ? e.target.value.split(',').map(skill => skill.trim()).filter(skill => skill) : []
                        })}
                        className="w-full p-3 bg-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-red-600 focus:outline-none text-black"
                        placeholder="React, Node.js, Python, etc."
                      />
                    </div>

                    {/* Platform Links Section */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Platform Links
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">GitHub Username</label>
                          <input
                            type="text"
                            value={userInfo.links?.github || ''}
                            onChange={(e) => handleLinkChange('github', e.target.value)}
                            className="w-full p-2 bg-white rounded border border-gray-700 focus:ring-2 focus:ring-red-600 focus:outline-none text-black text-sm"
                            placeholder="Your GitHub username"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">GeeksforGeeks Profile</label>
                          <input
                            type="text"
                            value={userInfo.links?.gfg || ''}
                            onChange={(e) => handleLinkChange('gfg', e.target.value)}
                            className="w-full p-2 bg-white rounded border border-gray-700 focus:ring-2 focus:ring-red-600 focus:outline-none text-black text-sm"
                            placeholder="Your GFG profile ID"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">LeetCode Username</label>
                          <input
                            type="text"
                            value={userInfo.links?.leetcode || ''}
                            onChange={(e) => handleLinkChange('leetcode', e.target.value)}
                            className="w-full p-2 bg-white rounded border border-gray-700 focus:ring-2 focus:ring-red-600 focus:outline-none text-black text-sm"
                            placeholder="Your LeetCode username"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">CodeChef Username</label>
                          <input
                            type="text"
                            value={userInfo.links?.codechef || ''}
                            onChange={(e) => handleLinkChange('codechef', e.target.value)}
                            className="w-full p-2 bg-white rounded border border-gray-700 focus:ring-2 focus:ring-red-600 focus:outline-none text-black text-sm"
                            placeholder="Your CodeChef username"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Code360 Profile ID</label>
                          <input
                            type="text"
                            value={userInfo.links?.code360 || ''}
                            onChange={(e) => handleLinkChange('code360', e.target.value)}
                            className="w-full p-2 bg-white rounded border border-gray-700 focus:ring-2 focus:ring-red-600 focus:outline-none text-black text-sm"
                            placeholder="Your Code360 profile ID"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Codeforces Username</label>
                          <input
                            type="text"
                            value={userInfo.links?.codeforces || ''}
                            onChange={(e) => handleLinkChange('codeforces', e.target.value)}
                            className="w-full p-2 bg-white rounded border border-gray-700 focus:ring-2 focus:ring-red-600 focus:outline-none text-black text-sm"
                            placeholder="Your Codeforces username"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleUpdateProfile}
                      disabled={loading}
                      className="bg-gradient-to-r from-red-800 to-red-700 hover:from-red-700 hover:to-red-600 px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v16a8 8 0 01-8-8z"/>
                        </svg>
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              )}

              {/* Account Tab */}
              {activeTab === 'account' && (
                <div className="space-y-8">
                  <h2 className="text-xl font-semibold text-red-300 mb-6">Account Settings</h2>
                  
                  {/* Current User Info Display */}
                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-200 mb-3">Current Information</h3>
                    <div className="space-y-2">
                      <p className="text-gray-300">
                        <span className="text-red-300">Username:</span> {user.username}
                      </p>
                      <p className="text-gray-300">
                        <span className="text-red-300">Email:</span> {user.email}
                        {user.emailVerified === false && (
                          <span className="ml-2 text-yellow-400 text-sm">(Unverified)</span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  {/* Username */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-200 mb-4">Update Username</h3>
                    <div className="flex gap-4">
                      <input
                        type="text"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        className="flex-1 p-3 bg-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-red-600 focus:outline-none text-black"
                        placeholder="New username"
                      />
                      <button
                        onClick={handleChangeUsername}
                        disabled={loading || newUsername === user.username}
                        className="bg-gradient-to-r from-red-800 to-red-700 hover:from-red-700 hover:to-red-600 px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Updating...' : 'Update'}
                      </button>
                    </div>
                  </div>
                  {/* Email */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-200 mb-4">Update Email Address</h3>
                    <div className="flex gap-4">
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="flex-1 p-3 bg-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-red-600 focus:outline-none text-black"
                        placeholder="New email address"
                      />
                      <button
                        onClick={handleChangeEmail}
                        disabled={loading || newEmail === user.email}
                        className="bg-gradient-to-r from-red-800 to-red-700 hover:from-red-700 hover:to-red-600 px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Updating...' : 'Update'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-8">
                  <h2 className="text-xl font-semibold text-red-300 mb-6">Security Settings</h2>
                  
                  {/* Change Password */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-200 mb-4">Change Password</h3>
                    <form 
                      onSubmit={(e) => {
                        console.log('🔵 Form submission triggered');
                        handleChangePassword(e);
                      }}
                      className="space-y-4"
                    >
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => {
                            console.log('Current password input changed');
                            setCurrentPassword(e.target.value);
                          }}
                          className="w-full p-3 bg-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-red-600 focus:outline-none pr-12 text-black"
                          placeholder="Current password"
                          required
                          minLength={6}
                          name="currentPassword"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>

                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => {
                            console.log('New password input changed');
                            setNewPassword(e.target.value);
                          }}
                          className="w-full p-3 bg-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-red-600 focus:outline-none pr-12 text-black"
                          placeholder="New password"
                          required
                          minLength={6}
                          name="newPassword"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>

                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full p-3 bg-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-red-600 focus:outline-none text-black"
                        placeholder="Confirm new password"
                        required
                        minLength={6}
                        name="confirmPassword"
                      />

                      <button
                        type="submit"
                        disabled={!currentPassword || !newPassword || !confirmPassword || loading}
                        className="w-full bg-gradient-to-r from-red-800 to-red-700 hover:from-red-700 hover:to-red-600 px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 01-8-8v16a8 8 0 01-8-8z"/>
                          </svg>
                        ) : (
                          <Lock className="w-4 h-4 mr-2" />
                        )}
                        {loading ? 'Changing...' : 'Change Password'}
                      </button>
                    </form>
                  </div>

                  {/* Forgot Password */}
                  <div className="border-t border-gray-700 pt-8">
                    <h3 className="text-lg font-medium text-gray-200 mb-4">Reset Password via Email</h3>
                    <p className="text-gray-400 mb-4">
                      Send a password reset code to your email address: <span className="text-red-300 font-medium">{user.email}</span>
                    </p>
                    <button
                      onClick={handleForgotPassword}
                      disabled={loading}
                      className="bg-gradient-to-r from-blue-800 to-blue-700 hover:from-blue-700 hover:to-blue-600 px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v16a8 8 0 01-8-8z"/>
                        </svg>
                      ) : (
                        <Mail className="w-4 h-4 mr-2" />
                      )}
                      {loading ? 'Sending...' : 'Send Reset Code'}
                    </button>
                  </div>
                </div>
              )}

              {/* Danger Zone Tab */}
              {activeTab === 'danger' && (
                <div>
                  <h2 className="text-xl font-semibold text-red-400 mb-6">Danger Zone</h2>
                  
                  <div className="bg-red-900/20 border border-red-800 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-red-400 mb-4 flex items-center">
                      <AlertCircle className="w-5 h-5 mr-2" />
                      Delete Account
                    </h3>
                    <p className="text-gray-300 mb-6">
                      Once you delete your account, there is no going back. Please be certain.
                      All your data including profile information, posts, and account details will be permanently removed from our servers.
                    </p>
                    
                    <div className="bg-red-950/30 border border-red-800/50 rounded-lg p-4 mb-6">
                      <h4 className="text-red-300 font-medium mb-2">This action will:</h4>
                      <ul className="text-gray-300 text-sm space-y-1 ml-4">
                        <li>• Delete your profile and all personal information</li>
                        <li>• Remove all your posts and comments</li>
                        <li>• Cancel any active subscriptions</li>
                        <li>• Make your username available for others</li>
                        <li>• Cannot be undone or recovered</li>
                      </ul>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        To confirm deletion, type <span className="text-red-400 font-bold">DELETE</span> in the field below:
                      </label>
                      <input
                        type="text"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        className="w-full p-3 bg-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-red-600 focus:outline-none text-black"
                        placeholder="Type DELETE to confirm"
                      />
                    </div>

                    <button
                      onClick={handleDeleteAccount}
                      disabled={loading || deleteConfirmText !== 'DELETE'}
                      className="bg-gradient-to-r from-red-900 to-red-800 hover:from-red-800 hover:to-red-700 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v16a8 8 0 01-8-8z"/>
                        </svg>
                      ) : (
                        <Trash2 className="w-4 h-4 mr-2" />
                      )}
                      {loading ? 'Deleting Account...' : 'Delete My Account'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;