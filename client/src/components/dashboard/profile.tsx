import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { profileService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { 
  User, 
  MapPin, 
  Building, 
  Mail, 
  Link, 
  Calendar,
  Trophy,
  Star,
  ChevronRight,
  BarChart3,
  Code,
  Target,
  Award,
  Eye,
  RefreshCw,
  Settings,
  LogOut,
  Edit3,
  Share2,
  Menu,
  X,
  Bell,
  Shield,
  Palette,
  Download,
  ExternalLink,
  Copy
} from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../../common/ErrorAlert';

// Type definitions based on your backend data structure
interface EnhancedProfileData {
  profile: {
    name: string;
    username: string;
    bio: string;
    avatar: string;
    location: string;
    institute: string;
    graduationYear: number;
    profileViews: number;
    lastRefresh: string;
  };
  overview: {
    totalQuestions: number;
    totalActiveDays: number;
    totalContests: number;
    maxStreak: number;
    currentStreak: number;
  };
  problemsSolved: {
    dsa: {
      easy: number;
      medium: number;
      hard: number;
      total: number;
    };
    competitiveProgramming: {
      codechef: number;
      codeforces: number;
      total: number;
    };
  };
  platforms: {
    [key: string]: {
      name: string;
      handle: string;
      rating?: number;
      maxRating?: number;
      totalSolved: number;
      rank?: string | number;
    };
  };
  awards: Array<{
    id: string;
    title: string;
    icon: string;
    color: string;
  }>;
  topicAnalysis: {
    [key: string]: number;
  };
}

const CodingProfileDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [profileData, setProfileData] = useState<EnhancedProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);


  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    if (!user?.username) {
      console.log('Username is missing in user context');
      setError('Username is missing');
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      setRefreshing(true);
      const response = await profileService.getPublicProfile(user.username);
      setProfileData(response.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
      showToast('Logged out successfully', 'success');
    } catch (error) {
      showToast('Error logging out', 'error');
    }
  };

  const handleRefreshProfile = async () => {
    await fetchProfileData();
    showToast('Profile refreshed successfully', 'success');
  };

  const handleShareProfile = async () => {
    const profileUrl = `${window.location.origin}/profile/${profileData?.profile?.username}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${profileData?.profile?.name}'s Coding Profile`,
          text: `Check out my coding profile on DevPlaza`,
          url: profileUrl
        });
      } else {
        await navigator.clipboard.writeText(profileUrl);
        showToast('Profile link copied to clipboard!', 'success');
      }
    } catch (err) {
      showToast('Failed to share profile', 'error');
    }
  };

  const getProgressPercentage = (solved: number, total: number) => {
    if (total === 0) return 0;
    return (solved / total) * 100;
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 70) return 'bg-gradient-to-r from-green-500 to-green-400';
    if (percentage >= 50) return 'bg-gradient-to-r from-yellow-500 to-yellow-400';
    if (percentage >= 30) return 'bg-gradient-to-r from-orange-500 to-orange-400';
    return 'bg-gradient-to-r from-red-500 to-red-400';
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;
  if (!profileData) return <ErrorAlert message="Profile data not available" />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950 text-white">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-gradient-to-r from-red-800 to-red-600 rounded-lg"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        profileData={profileData}
        onLogout={handleLogout}
        onShareProfile={handleShareProfile}
        onRefreshProfile={handleRefreshProfile}
        refreshing={refreshing}
      />

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'md:ml-80' : 'md:ml-80'}`}>
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-4">
              <img 
                src={profileData.profile.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${profileData.profile.name}`}
                alt={profileData.profile.name}
                className="w-16 h-16 rounded-full border-2 border-red-400"
                onError={(e) => {
                  e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${profileData.profile.name}`;
                }}
              />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-red-200 bg-clip-text text-transparent">
                  {profileData.profile.name}
                </h1>
                <p className="text-gray-400">@{profileData.profile.username}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleShareProfile}
                className="bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2 rounded-lg flex items-center space-x-2 hover:from-blue-500 hover:to-blue-400 transition-all duration-300"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Profile</span>
              </button>
              <button
                onClick={() => navigate('/profile/edit')}
                className="bg-gradient-to-r from-green-600 to-green-500 px-4 py-2 rounded-lg flex items-center space-x-2 hover:from-green-500 hover:to-green-400 transition-all duration-300"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Questions"
              value={profileData.overview.totalQuestions}
              icon={<Code className="w-6 h-6" />}
              color="from-blue-500 to-blue-400"
            />
            <StatCard
              title="Active Days"
              value={profileData.overview.totalActiveDays}
              icon={<Calendar className="w-6 h-6" />}
              color="from-green-500 to-green-400"
            />
            <StatCard
              title="Max Streak"
              value={profileData.overview.maxStreak}
              icon={<Target className="w-6 h-6" />}
              color="from-orange-500 to-orange-400"
            />
            <StatCard
              title="Total Contests"
              value={profileData.overview.totalContests}
              icon={<Trophy className="w-6 h-6" />}
              color="from-purple-500 to-purple-400"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Problems Solved */}
            <div className="bg-gradient-to-br from-gray-900 via-red-950 to-black border border-red-900/30 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-red-400 to-red-200 bg-clip-text text-transparent">
                Problems Solved
              </h3>
              
              {/* DSA Problems */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold mb-4 text-gray-300">Data Structures & Algorithms</h4>
                <div className="space-y-3">
                  <DifficultyBar 
                    label="Easy" 
                    solved={profileData.problemsSolved.dsa.easy} 
                    color="bg-green-500" 
                  />
                  <DifficultyBar 
                    label="Medium" 
                    solved={profileData.problemsSolved.dsa.medium} 
                    color="bg-yellow-500" 
                  />
                  <DifficultyBar 
                    label="Hard" 
                    solved={profileData.problemsSolved.dsa.hard} 
                    color="bg-red-500" 
                  />
                </div>
                <div className="text-center mt-4">
                  <div className="text-2xl font-bold bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">
                    {profileData.problemsSolved.dsa.total}
                  </div>
                  <div className="text-xs text-gray-400">Total DSA</div>
                </div>
              </div>

              {/* Competitive Programming */}
              <div>
                <h4 className="text-sm font-semibold mb-4 text-gray-300">Competitive Programming</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">CodeChef:</span>
                    <span className="text-red-400 font-medium">{profileData.problemsSolved.competitiveProgramming.codechef}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Codeforces:</span>
                    <span className="text-red-400 font-medium">{profileData.problemsSolved.competitiveProgramming.codeforces}</span>
                  </div>
                </div>
                <div className="text-center mt-4">
                  <div className="text-2xl font-bold bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">
                    {profileData.problemsSolved.competitiveProgramming.total}
                  </div>
                  <div className="text-xs text-gray-400">Total CP</div>
                </div>
              </div>
            </div>

            {/* Platform Rankings */}
            <div className="bg-gradient-to-br from-gray-900 via-red-950 to-black border border-red-900/30 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-red-400 to-red-200 bg-clip-text text-transparent">
                Platform Rankings
              </h3>
              <div className="space-y-4">
                {Object.entries(profileData.platforms).map(([key, platform]) => (
                  <PlatformCard key={key} platform={platform} />
                ))}
              </div>
            </div>

            {/* Awards & Achievements */}
            <div className="bg-gradient-to-br from-gray-900 via-red-950 to-black border border-red-900/30 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-red-400 to-red-200 bg-clip-text text-transparent">
                Awards & Achievements
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {profileData.awards.map((award, index) => (
                  <div key={award.id || index} className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-700 to-red-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      {award.icon === 'trophy' && <Trophy className="w-6 h-6 text-red-200" />}
                      {award.icon === 'star' && <Star className="w-6 h-6 text-red-200" />}
                      {award.icon === 'medal' && <Award className="w-6 h-6 text-red-200" />}
                    </div>
                    <p className="text-xs text-gray-400">{award.title}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Topic Analysis */}
          <div className="bg-gradient-to-br from-gray-900 via-red-950 to-black border border-red-900/30 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-red-400 to-red-200 bg-clip-text text-transparent">
              Topic Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(profileData.topicAnalysis)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 9)
                .map(([topic, count]) => (
                  <div key={topic} className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-lg">
                    <span className="text-gray-300 capitalize">
                      {topic.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="text-red-400 font-semibold">{count}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sidebar Component
const Sidebar: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  user: any;
  profileData: EnhancedProfileData;
  onLogout: () => void;
  onShareProfile: () => void;
  onRefreshProfile: () => void;
  refreshing: boolean;
}> = ({ isOpen, onClose, user, profileData, onLogout, onShareProfile, onRefreshProfile, refreshing }) => {
  const navigate = useNavigate();

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" 
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-80 bg-gradient-to-br from-gray-900 via-red-950 to-black border-r border-red-900/30 z-50 transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0`}>
        
        {/* Header */}
        <div className="p-6 border-b border-red-900/30">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold bg-gradient-to-r from-red-400 to-red-200 bg-clip-text text-transparent">
              Profile Settings
            </h2>
            <button
              onClick={onClose}
              className="md:hidden p-2 hover:bg-red-900/30 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Profile Info */}
        <div className="p-6 border-b border-red-900/30">
          <div className="flex items-center space-x-3 mb-4">
            <img 
              src={profileData.profile.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${profileData.profile.name}`}
              alt={profileData.profile.name}
              className="w-12 h-12 rounded-full border border-red-400"
            />
            <div>
              <h3 className="font-semibold text-gray-200">{profileData.profile.name}</h3>
              <p className="text-sm text-gray-400">@{profileData.profile.username}</p>
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2 text-gray-300">
              <Eye className="w-4 h-4 text-red-400" />
              <span>{profileData.profile.profileViews} profile views</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-300">
              <RefreshCw className="w-4 h-4 text-red-400" />
              <span>Updated {new Date(profileData.profile.lastRefresh).toLocaleDateString()}</span>
            </div>
            {profileData.profile.location && (
              <div className="flex items-center space-x-2 text-gray-300">
                <MapPin className="w-4 h-4 text-red-400" />
                <span>{profileData.profile.location}</span>
              </div>
            )}
            {profileData.profile.institute && (
              <div className="flex items-center space-x-2 text-gray-300">
                <Building className="w-4 h-4 text-red-400" />
                <span>{profileData.profile.institute}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 space-y-3">
          <button
            onClick={() => navigate('/profile/edit')}
            className="w-full flex items-center space-x-3 p-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 rounded-lg transition-all duration-300"
          >
            <Edit3 className="w-5 h-5" />
            <span>Edit Profile</span>
          </button>

          <button
            onClick={onShareProfile}
            className="w-full flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-lg transition-all duration-300"
          >
            <Share2 className="w-5 h-5" />
            <span>Share Profile</span>
          </button>

          <button
            onClick={onRefreshProfile}
            disabled={refreshing}
            className="w-full flex items-center space-x-3 p-3 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 disabled:opacity-50 rounded-lg transition-all duration-300"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
          </button>

          <button
            onClick={() => navigate('/settings')}
            className="w-full flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-500 hover:to-gray-400 rounded-lg transition-all duration-300"
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 p-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 rounded-lg transition-all duration-300"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>

        {/* Platform Links */}
        <div className="p-6 border-t border-red-900/30">
          <h4 className="text-sm font-semibold text-gray-300 mb-3">Quick Links</h4>
          <div className="space-y-2">
            {Object.entries(profileData.platforms).map(([key, platform]) => (
              <a
                key={key}
                href={`#`}
                className="flex items-center justify-between p-2 hover:bg-red-900/20 rounded-lg transition-colors text-sm"
              >
                <span className="text-gray-400">{platform.name}</span>
                <ExternalLink className="w-4 h-4 text-red-400" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

// Helper Components
const StatCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, icon, color }) => (
  <div className="bg-gradient-to-br from-gray-900 via-red-950 to-black border border-red-900/30 rounded-lg p-6">
    <div className="flex items-center justify-between mb-2">
      <div className={`p-2 rounded-lg bg-gradient-to-r ${color} bg-opacity-20`}>
        {icon}
      </div>
    </div>
    <p className="text-2xl font-bold bg-gradient-to-r from-red-400 to-red-200 bg-clip-text text-transparent">
      {value.toLocaleString()}
    </p>
    <p className="text-gray-400 text-sm mt-1">{title}</p>
  </div>
);

const DifficultyBar: React.FC<{
  label: string;
  solved: number;
  color: string;
}> = ({ label, solved, color }) => (
  <div className="flex items-center justify-between">
    <span className="text-gray-300 text-sm w-16">{label}</span>
    <div className="flex-1 mx-3 bg-gray-800 rounded-full h-2">
      <div 
        className={`${color} rounded-full h-2 transition-all duration-300`}
        style={{ width: `${Math.min(100, (solved / 50) * 100)}%` }}
      />
    </div>
    <span className="text-gray-400 text-sm w-8">{solved}</span>
  </div>
);

const PlatformCard: React.FC<{
  platform: {
    name: string;
    handle: string;
    rating?: number;
    totalSolved: number;
    rank?: string | number;
  };
}> = ({ platform }) => (
  <div className="p-3 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-lg">
    <h4 className="font-semibold text-gray-200 mb-2">{platform.name}</h4>
    <div className="text-sm space-y-1">
      <div className="flex justify-between">
        <span className="text-gray-400">Handle:</span>
        <span className="text-gray-300">{platform.handle}</span>
      </div>
      {platform.rating && (
        <div className="flex justify-between">
          <span className="text-gray-400">Rating:</span>
          <span className="text-red-400 font-medium">{platform.rating}</span>
        </div>
      )}
      <div className="flex justify-between">
        <span className="text-gray-400">Solved:</span>
        <span className="text-red-400 font-medium">{platform.totalSolved}</span>
      </div>
    </div>
  </div>
);

export default CodingProfileDashboard;