import React, { useState, useEffect } from 'react';
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
  Shield
} from 'lucide-react';

const API = "http://localhost:5000"; // Replace with your API base URL

interface UserInfo {
  fullName?: string;
  bio?: string;
  location?: string;
  links?: string[];
  skills?: string[];
  experience?: string;
}

interface User {
  _id: string;
  username: string;
  email: string;
}

const Settings: React.FC = () => {
  // Mock user data - replace with your auth context
  const [user] = useState<User>({ _id: '123', username: 'johnDoe', email: 'john@example.com' });
  
  // Form states
  const [userInfo, setUserInfo] = useState<UserInfo>({});
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  useEffect(() => {
    fetchUserInfo();
    if (user) {
      setNewUsername(user.username || '');
      setNewEmail(user.email || '');
    }
  }, [user]);

  const fetchUserInfo = async () => {
    if (!user?._id) return;
    
    try {
      const response = await fetch(`${API}/api/user-info/${user._id}`);
      const data = await response.json();
      if (data.success) {
        setUserInfo(data.data);
      }
    } catch (err) {
      console.error('Error fetching user info:', err);
    }
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
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
      const response = await fetch(`${API}/api/user-info`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(userInfo)
      });

      const data = await response.json();
      if (data.success) {
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

    setLoading(true);
    clearMessages();

    try {
      console.log('🔄 Updating username to:', newUsername);
      const response = await fetch(`${API}/api/auth/update-username`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ username: newUsername })
      });

      const data = await response.json();
      if (data.success) {
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
      const response = await fetch(`${API}/api/auth/update-email`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ email: newEmail })
      });

      const data = await response.json();
      if (data.success) {
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

  const handleChangePassword = async () => {
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
      console.log('🔄 Changing password');
      const response = await fetch(`${API}/api/auth/change-password`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      const data = await response.json();
      if (data.success) {
        setMessage('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        console.log('✅ Password changed successfully');
      } else {
        setError(data.message || 'Failed to change password');
      }
    } catch (err: any) {
      console.error('❌ Password change error:', err);
      setError('Failed to change password');
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
      const response = await fetch(`${API}/api/user-info`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      const data = await response.json();
      if (data.success) {
        // Also delete user account
        await fetch(`${API}/api/auth/delete-account`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });
        
        console.log('✅ Account deleted successfully');
        // Handle logout and redirect
        localStorage.removeItem('accessToken');
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

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'account', label: 'Account', icon: Shield },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'danger', label: 'Danger Zone', icon: AlertCircle }
  ];

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
                      <p className="text-gray-300"><span className="text-red-300">Username:</span> {user.username}</p>
                      <p className="text-gray-300"><span className="text-red-300">Email:</span> {user.email}</p>
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
                    <div className="space-y-4">
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full p-3 bg-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-red-600 focus:outline-none pr-12 text-black"
                          placeholder="Current password"
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
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full p-3 bg-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-red-600 focus:outline-none pr-12 text-black"
                          placeholder="New password"
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
                      />

                      <button
                        onClick={handleChangePassword}
                        disabled={loading}
                        className="bg-gradient-to-r from-red-800 to-red-700 hover:from-red-700 hover:to-red-600 px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v16a8 8 0 01-8-8z"/>
                          </svg>
                        ) : (
                          <Lock className="w-4 h-4 mr-2" />
                        )}
                        {loading ? 'Changing...' : 'Change Password'}
                      </button>
                    </div>
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