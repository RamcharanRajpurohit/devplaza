import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { profileService } from '../../services/api';
import type { ProfileData } from '../../types/profile';
import { User, MapPin, Building, Eye, RefreshCw, Trophy, Star, ChevronRight, BarChart3, Code, Target, Award, Share2 } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../../common/ErrorAlert';
import { useToast } from '../../context/ToastContext';

const PublicProfile: React.FC = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublicProfile = async () => {
      if (!username) {
        setError('Username is missing');
        console.log('❌ Username parameter is missing in URL');
        setLoading(false);
        return;
      }
      try {
        console.log(`🔍 Fetching public profile for username: ${username}`);
        const response = await profileService.getPublicProfile(username);
        console.log('✅ Public profile data fetched successfully:', response.data);
        setProfileData(response.data);
       
        // Record view
        // await profileService.recordProfileView(username);
      } catch (err: any) {
        console.error('❌ Error fetching public profile:', err);
        setError(err.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchPublicProfile();
  }, [username]);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${profileData?.fullName || 'User'}'s Coding Profile`,
          text: `Check out ${profileData?.fullName || 'this user'}'s coding profile on DevPlaza`,
          url: window.location.href
        });
        showToast('Profile shared successfully!', 'success');
      } else {
        await navigator.clipboard.writeText(window.location.href);
        showToast('Profile link copied to clipboard!', 'success');
      }
    } catch (err) {
      showToast('Failed to share profile', 'error');
    }
  };

  const getProgressPercentage = (solved: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((solved / total) * 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 70) return 'bg-gradient-to-r from-red-800 to-red-600';
    if (percentage >= 50) return 'bg-gradient-to-r from-red-900 to-red-700';
    return 'bg-gradient-to-r from-red-950 to-red-800';
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;
  if (!profileData) return <ErrorAlert message="Profile data not available" />;

  // Safe access to profile data with fallbacks
  const fullName = profileData.fullName || 'Anonymous User';
  const username_display = profileData.username || username || 'user';
  const viewCount = profileData.viewCount || 0;
  const lastRefresh = profileData.lastRefresh ? new Date(profileData.lastRefresh).toLocaleDateString() : 'Never';
  const totalQuestions = profileData.totalQuestions || 0;
  const totalActiveDays = profileData.totalActiveDays || 0;
  const totalContests = profileData.totalContests || 0;
  const awards = profileData.awards || 0;
  const platformStats = profileData.platformStats || [];
  const dsaTopics = profileData.dsaTopics || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-red-800 to-red-600 rounded-full flex items-center justify-center text-2xl font-bold">
              {fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-red-200 bg-clip-text text-transparent">
                {fullName}
              </h1>
              <p className="text-gray-400">@{username_display}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>{viewCount} views</span>
            </div>
            <div className="flex items-center space-x-1">
              <RefreshCw className="w-4 h-4" />
              <span>Last updated: {lastRefresh}</span>
            </div>
          </div>
        </div>

        {/* Add Share Button */}
        <button 
          onClick={handleShare}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-red-800 to-red-600 p-3 rounded-full shadow-lg hover:from-red-700 hover:to-red-500 transition-all duration-300"
        >
          <Share2 className="w-6 h-6" />
        </button>

        {/* Profile Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Stats Cards */}
          <StatsCard
            title="Total Questions"
            value={totalQuestions}
            icon={<Code />}
          />
          <StatsCard
            title="Active Days"
            value={totalActiveDays}
            icon={<BarChart3 />}
          />
          <StatsCard
            title="Contests"
            value={totalContests}
            icon={<Trophy />}
          />
          <StatsCard
            title="Awards"
            value={awards}
            icon={<Award />}
          />
        </div>

        {/* Platform Stats and DSA Progress */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Platform Stats */}
          <div className="bg-gradient-to-br from-gray-900 via-red-950 to-black border border-red-900/30 rounded-lg p-6">
            <h3 className="font-semibold mb-4 bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">
              Platform Statistics
            </h3>
            {platformStats.length > 0 ? (
              platformStats.map((platform, index) => (
                <PlatformStatCard key={platform.name || index} {...platform} />
              ))
            ) : (
              <p className="text-gray-400">No platform statistics available</p>
            )}
          </div>

          {/* DSA Progress */}
          <div className="bg-gradient-to-br from-gray-900 via-red-950 to-black border border-red-900/30 rounded-lg p-6">
            <h3 className="font-semibold mb-4 bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">
              DSA Progress
            </h3>
            {dsaTopics.length > 0 ? (
              dsaTopics.map((topic, index) => (
                <TopicProgressBar key={topic.name || index} {...topic} />
              ))
            ) : (
              <p className="text-gray-400">No DSA progress data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const StatsCard: React.FC<{ title: string; value: number; icon: React.ReactNode }> = ({ title, value, icon }) => (
  <div className="bg-gradient-to-br from-gray-900 via-red-950 to-black border border-red-900/30 rounded-lg p-6">
    <div className="flex items-center justify-between">
      <h3 className="text-gray-400">{title}</h3>
      <div className="text-red-400">{icon}</div>
    </div>
    <p className="text-2xl font-bold mt-2 bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">
      {value || 0}
    </p>
  </div>
);

const PlatformStatCard: React.FC<{ name: string; rank: number; maxRank: number }> = ({ name, rank, maxRank }) => (
  <div className="flex items-center justify-between py-2 border-b border-red-900/20">
    <span className="text-gray-300">{name || 'Unknown Platform'}</span>
    <span className="text-red-400">Rank {rank || 'N/A'}</span>
  </div>
);

const TopicProgressBar: React.FC<{ name: string; solved: number; total: number }> = ({ name, solved, total }) => {
  const getProgressPercentage = (solved: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((solved / total) * 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 70) return 'bg-gradient-to-r from-red-800 to-red-600';
    if (percentage >= 50) return 'bg-gradient-to-r from-red-900 to-red-700';
    return 'bg-gradient-to-r from-red-950 to-red-800';
  };

  const percentage = getProgressPercentage(solved || 0, total || 0);
  
  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-300">{name || 'Unknown Topic'}</span>
        <span className="text-red-400">{solved || 0}/{total || 0}</span>
      </div>
      <div className="bg-gray-800 rounded-full h-2">
        <div 
          className={`${getProgressColor(percentage)} rounded-full h-2 transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default PublicProfile;