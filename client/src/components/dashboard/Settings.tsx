import React, { useState, useEffect} from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  User, Mail, Lock, Trash2, Save, Eye, EyeOff, AlertCircle,
  CheckCircle, Shield, RefreshCw, Link,ArrowLeft
} from 'lucide-react';

const API = "https://localhost:5000";

interface UserInfoFormData {
  fullName: string;
  bio: string;
  location: string;
  phone: string;
  email: string;
  portfolio: string;
  institute: string;
  graduationYear: string;
  links: {
    github: string;
    linkedin: string;
    twitter: string;
    instagram: string;
    gfg: string;
    leetcode: string;
    codechef: string;
    code360: string;
    codeforces: string;
    hackerrank: string;
  };
  skills: string[];
  experience: {
    years: string;
    currentRole: string;
    company: string;
  };
}

interface User {
  _id: string;
  username: string;
  email: string;
  emailVerified?: boolean;
}

const Settings: React.FC = () => {
  const { refreshToken, updateUser } = useAuth();

  const [user, setUser] = useState<User | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfoFormData>({
    fullName: '', bio: '', location: '', phone: '', email: '', portfolio: '',
    institute: '', graduationYear: '',
    links: {
      github: '', linkedin: '', twitter: '', instagram: '', gfg: '', leetcode: '',
      codechef: '', code360: '', codeforces: '', hackerrank: ''
    },
    skills: [],
    experience: { years: '', currentRole: '', company: '' }
  });

  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
      setError('Failed to load user data');
    } finally {
      setInitialLoading(false);
    }
  };

  const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
    const makeRequest = async (headers: Record<string, string>) => {
      return fetch(url, { ...options, headers: { ...options.headers, ...headers } });
    };

    let response = await makeRequest(getAuthHeaders());

    if (response.status === 401 || response.status ===403) {
      try {
        await refreshToken();
        response = await makeRequest(getAuthHeaders());
      } catch (refreshError) {
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
      } else if (response.status === 401) {
        window.location.href = '/auth/login';
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
        const normalizeSkills = (val: any) => {
          if (Array.isArray(val)) return val;
          if (typeof val === 'string') {
            return val.split(',').map((s: string) => s.trim()).filter((s: string) => s);
          }
          return [];
        };

        setUserInfo({
          fullName: data.data.fullName || '',
          bio: data.data.bio || '',
          location: data.data.location || '',
          phone: data.data.phone || '',
          email: data.data.email || '',
          portfolio: data.data.portfolio || '',
          institute: data.data.institute || '',
          graduationYear: data.data.graduationYear || '',
          links: {
            github: data.data.links?.github || '',
            linkedin: data.data.links?.linkedin || '',
            twitter: data.data.links?.twitter || '',
            instagram: data.data.links?.instagram || '',
            gfg: data.data.links?.gfg || '',
            leetcode: data.data.links?.leetcode || '',
            codechef: data.data.links?.codechef || '',
            code360: data.data.links?.code360 || '',
            codeforces: data.data.links?.codeforces || '',
            hackerrank: data.data.links?.hackerrank || ''
          },
          skills: normalizeSkills(data.data.skills),
          experience: {
            years: data.data.experience?.years || '',
            currentRole: data.data.experience?.currentRole || '',
            company: data.data.experience?.company || ''
          }
        });
      }
    } catch (err) {
      console.error('Error fetching user info:', err);
    }
  };

  const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/auth/login';
      return { 'Authorization': '', 'Content-Type': 'application/json' };
    }
    return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
  };

  const clearMessages = () => {
    setError('');
    setMessage('');
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    clearMessages();
    try {
      const response = await makeAuthenticatedRequest(`${API}/api/user-info`, {
        method: 'PUT',
        body: JSON.stringify(userInfo)
      });
      const data = await response.json();
      if (data.success) {
        setUserInfo(data.data);
        setMessage('Profile updated successfully!');
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeUsername = async () => {
    if (!newUsername.trim() || newUsername.trim().length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }
    setLoading(true);
    clearMessages();
    try {
      const response = await makeAuthenticatedRequest(`${API}/api/auth/update-username`, {
        method: 'PATCH',
        body: JSON.stringify({ username: newUsername.trim() })
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.data);
        updateUser({ ...data.data, username: data.data.username });
        setMessage('Username updated successfully!');
      } else {
        setError(data.message || 'Failed to update username');
      }
    } catch (err) {
      setError('Failed to update username');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEmail = async () => {
    if (!newEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      setError('Please enter a valid email address');
      return;
    }
    setLoading(true);
    clearMessages();
    try {
      const response = await makeAuthenticatedRequest(`${API}/api/auth/update-email`, {
        method: 'PATCH',
        body: JSON.stringify({ email: newEmail.trim() })
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.data);
        updateUser({ ...data.data, email: data.data.email });
        setMessage('Email updated successfully! Please verify your new email.');
      } else {
        setError(data.message || 'Failed to update email');
      }
    } catch (err) {
      setError('Failed to update email');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All password fields are required');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    clearMessages();
    try {
      const response = await makeAuthenticatedRequest(`${API}/api/auth/change-password`, {
        method: 'PATCH',
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await response.json();
      if (data.success) {
        setMessage('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(data.message || 'Failed to change password');
      }
    } catch (err) {
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
      const response = await fetch(`${API}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email })
      });
      const data = await response.json();
      if (data.success) {
        setMessage('Password reset code sent to your email!');
      } else {
        setError(data.message || 'Failed to send reset email');
      }
    } catch (err) {
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
      const response = await makeAuthenticatedRequest(`${API}/api/auth/delete-account`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth/login';
      } else {
        setError(data.message || 'Failed to delete account');
      }
    } catch (err) {
      setError('Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ label, value, onChange, placeholder, type = 'text' }: any) => (
    <div>
      <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="w-full p-2 sm:p-3 bg-gray-800/50 rounded-lg border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 text-sm"
        placeholder={placeholder}
      />
    </div>
  );

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'links', label: 'Links', icon: Link },
    { id: 'account', label: 'Account', icon: Shield },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'danger', label: 'Danger Zone', icon: AlertCircle }

  ];

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950 p-4 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-red-400 mx-auto mb-4" />
          <p className="text-gray-400">Loading your settings...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950 p-4 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-4" />
          <p className="text-gray-400">Failed to load user data. Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950 p-2 sm:p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 sm:mb-8 flex items-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="p-2 hover:bg-red-900/20 rounded-lg transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">
            Settings
          </h1>
        </div>

        {message && (
          <div className="mb-4 sm:mb-6 bg-green-900/50 border border-green-800 text-green-200 px-4 py-2 rounded-lg flex items-center text-sm">
            <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 sm:mb-6 bg-red-900/50 border border-red-800 text-red-200 px-4 py-2 rounded-lg flex items-center text-sm">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-gray-900 via-red-950 to-black border border-red-900/30 rounded-lg p-3 sm:p-4">
              <nav className="space-y-1 sm:space-y-2">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => { setActiveTab(tab.id); clearMessages(); }}
                      className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-all duration-200 text-sm ${activeTab === tab.id
                          ? 'bg-red-900/30 text-red-300 border border-red-800'
                          : 'text-gray-400 hover:text-red-300 hover:bg-red-900/20'
                        }`}
                    >
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 flex-shrink-0" />
                      <span className="hidden sm:inline">{tab.label}</span>
                      <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-gradient-to-br from-gray-900 via-red-950 to-black border border-red-900/30 rounded-lg p-4 sm:p-6">

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-red-300 mb-4 sm:mb-6">Profile Information</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <InputField label="Full Name" value={userInfo.fullName}
                        onChange={(e: any) => setUserInfo({ ...userInfo, fullName: e.target.value })}
                        placeholder="Your full name" />
                      <InputField label="Email" value={userInfo.email} type="email"
                        onChange={(e: any) => setUserInfo({ ...userInfo, email: e.target.value })}
                        placeholder="your@email.com" />
                      <InputField label="Location" value={userInfo.location}
                        onChange={(e: any) => setUserInfo({ ...userInfo, location: e.target.value })}
                        placeholder="City, Country" />
                      <InputField label="Phone" value={userInfo.phone}
                        onChange={(e: any) => setUserInfo({ ...userInfo, phone: e.target.value })}
                        placeholder="+1234567890" />
                      <InputField label="Portfolio URL" value={userInfo.portfolio}
                        onChange={(e: any) => setUserInfo({ ...userInfo, portfolio: e.target.value })}
                        placeholder="https://yourportfolio.com" />
                      <InputField label="Institute" value={userInfo.institute}
                        onChange={(e: any) => setUserInfo({ ...userInfo, institute: e.target.value })}
                        placeholder="Your university/college" />
                      <InputField label="Graduation Year" value={userInfo.graduationYear}
                        onChange={(e: any) => setUserInfo({ ...userInfo, graduationYear: e.target.value })}
                        placeholder="2024" />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">Bio</label>
                      <textarea
                        value={userInfo.bio}
                        onChange={(e) => setUserInfo({ ...userInfo, bio: e.target.value })}
                        className="w-full p-2 sm:p-3 bg-gray-800/50 rounded-lg border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 text-sm"
                        placeholder="Tell us about yourself..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-3">Experience</label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <InputField label="Years" value={userInfo.experience.years}
                          onChange={(e: any) => setUserInfo({ ...userInfo, experience: { ...userInfo.experience, years: e.target.value } })}
                          placeholder="2" />
                        <InputField label="Current Role" value={userInfo.experience.currentRole}
                          onChange={(e: any) => setUserInfo({ ...userInfo, experience: { ...userInfo.experience, currentRole: e.target.value } })}
                          placeholder="Software Engineer" />
                        <InputField label="Company" value={userInfo.experience.company}
                          onChange={(e: any) => setUserInfo({ ...userInfo, experience: { ...userInfo.experience, company: e.target.value } })}
                          placeholder="Tech Corp" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">Skills (comma-separated)</label>
                      <input
                        type="text"
                        value={userInfo.skills.join(', ')}
                        onChange={(e) => setUserInfo({
                          ...userInfo,
                          skills: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                        })}
                        className="w-full p-2 sm:p-3 bg-gray-800/50 rounded-lg border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 text-sm"
                        placeholder="React, Node.js, Python"
                      />
                    </div>

                    
                    <button
                      onClick={handleUpdateProfile}
                      disabled={loading}
                      className="w-full sm:w-auto bg-gradient-to-r from-red-800 to-red-700 hover:from-red-700 hover:to-red-600 px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              )}

              {/* Account Tab */}
              {activeTab === 'links' && (
                <div>
                <h2 className="text-lg sm:text-xl font-semibold text-red-300 mb-4 sm:mb-6">Social & Coding Profiles</h2>
                <div className="space-y-4">
                  <div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Object.entries({
                        github: 'GitHub', linkedin: 'LinkedIn', twitter: 'Twitter',
                        instagram: 'Instagram', gfg: 'GeeksforGeeks', leetcode: 'LeetCode',
                        codechef: 'CodeChef', code360: 'Code360', codeforces: 'Codeforces',
                        hackerrank: 'HackerRank'
                      }).map(([key, label]) => (
                        <InputField
                          key={key}
                          label={label}
                          value={userInfo.links[key as keyof typeof userInfo.links]}
                          onChange={(e: any) => setUserInfo({
                            ...userInfo,
                            links: { ...userInfo.links, [key]: e.target.value }
                          })}
                          placeholder={`Your ${label} username`}
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleUpdateProfile}
                    disabled={loading}
                    className="w-full sm:w-auto bg-gradient-to-r from-red-800 to-red-700 hover:from-red-700 hover:to-red-600 px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>)}
              {activeTab === 'account' && (
                <div className="space-y-6 sm:space-y-8">
                  <h2 className="text-lg sm:text-xl font-semibold text-red-300 mb-4 sm:mb-6">Account Settings</h2>

                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                    <h3 className="text-base sm:text-lg font-medium text-gray-200 mb-3">Current Information</h3>
                    <div className="space-y-2 text-sm sm:text-base">
                      <p className="text-gray-300">
                        <span className="text-red-300">Username:</span> {user.username}
                      </p>
                      <p className="text-gray-300">
                        <span className="text-red-300">Email:</span> {user.email}
                        {user.emailVerified === false && (
                          <span className="ml-2 text-yellow-400 text-xs sm:text-sm">(Unverified)</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-medium text-gray-200 mb-4">Update Username</h3>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <input
                        type="text"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        className="flex-1 p-2 sm:p-3 bg-gray-800/50 rounded-lg border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 text-sm"
                        placeholder="New username"
                      />
                      <button
                        onClick={handleChangeUsername}
                        disabled={loading || newUsername === user.username}
                        className="bg-gradient-to-r from-red-800 to-red-700 hover:from-red-700 hover:to-red-600 px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        {loading ? 'Updating...' : 'Update'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-medium text-gray-200 mb-4">Update Email Address</h3>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="flex-1 p-2 sm:p-3 bg-gray-800/50 rounded-lg border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 text-sm"
                        placeholder="New email address"
                      />
                      <button
                        onClick={handleChangeEmail}
                        disabled={loading || newEmail === user.email}
                        className="bg-gradient-to-r from-red-800 to-red-700 hover:from-red-700 hover:to-red-600 px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        {loading ? 'Updating...' : 'Update'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-6 sm:space-y-8">
                  <h2 className="text-lg sm:text-xl font-semibold text-red-300 mb-4 sm:mb-6">Security Settings</h2>

                  <div>
                    <h3 className="text-base sm:text-lg font-medium text-gray-200 mb-4">Change Password</h3>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full p-2 sm:p-3 pr-10 bg-gray-800/50 rounded-lg border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 text-sm"
                          placeholder="Current password"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
                        >
                          {showCurrentPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                        </button>
                      </div>

                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full p-2 sm:p-3 pr-10 bg-gray-800/50 rounded-lg border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 text-sm"
                          placeholder="New password"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                        </button>
                      </div>

                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full p-2 sm:p-3 bg-gray-800/50 rounded-lg border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 text-sm"
                        placeholder="Confirm new password"
                        required
                        minLength={6}
                      />

                      <button
                        type="submit"
                        disabled={!currentPassword || !newPassword || !confirmPassword || loading}
                        className="w-full bg-gradient-to-r from-red-800 to-red-700 hover:from-red-700 hover:to-red-600 px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Lock className="w-4 h-4 mr-2" />}
                        {loading ? 'Changing...' : 'Change Password'}
                      </button>
                    </form>
                  </div>

                  <div className="border-t border-gray-700 pt-6 sm:pt-8">
                    <h3 className="text-base sm:text-lg font-medium text-gray-200 mb-4">Reset Password via Email</h3>
                    <p className="text-gray-400 mb-4 text-sm sm:text-base">
                      Send a password reset code to: <span className="text-red-300 font-medium">{user.email}</span>
                    </p>
                    <button
                      onClick={handleForgotPassword}
                      disabled={loading}
                      className="bg-gradient-to-r from-blue-800 to-blue-700 hover:from-blue-700 hover:to-blue-600 px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
                      {loading ? 'Sending...' : 'Send Reset Code'}
                    </button>
                  </div>
                </div>
              )}

              {/* Danger Zone Tab */}
              {activeTab === 'danger' && (
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-red-400 mb-4 sm:mb-6">Danger Zone</h2>

                  <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-medium text-red-400 mb-4 flex items-center">
                      <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                      Delete Account
                    </h3>
                    <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">
                      Once you delete your account, there is no going back. All your data will be permanently removed.
                    </p>

                    <div className="bg-red-950/30 border border-red-800/50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                      <h4 className="text-red-300 font-medium mb-2 text-sm sm:text-base">This action will:</h4>
                      <ul className="text-gray-300 text-xs sm:text-sm space-y-1 ml-4">
                        <li>• Delete your profile and all personal information</li>
                        <li>• Remove all your posts and comments</li>
                        <li>• Make your username available for others</li>
                        <li>• Cannot be undone or recovered</li>
                      </ul>
                    </div>

                    <div className="mb-4">
                      <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                        Type <span className="text-red-400 font-bold">DELETE</span> to confirm:
                      </label>
                      <input
                        type="text"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        className="w-full p-2 sm:p-3 bg-gray-800/50 rounded-lg border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 text-sm"
                        placeholder="Type DELETE to confirm"
                      />
                    </div>

                    <button
                      onClick={handleDeleteAccount}
                      disabled={loading || deleteConfirmText !== 'DELETE'}
                      className="w-full sm:w-auto bg-gradient-to-r from-red-900 to-red-800 hover:from-red-800 hover:to-red-700 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
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