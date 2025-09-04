import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { profileService } from '../../services/api';
import type { ProfileData } from '../../types/profile';
import { User, MapPin, Building, Eye, RefreshCw, Trophy, Star, ChevronRight, BarChart3, Code, Target, Award, Share2 } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
// import ErrorAlert from '../common/ErrorAlert';
// import ErrorAlert from '../common/ErrorAlert'; // Ensure this path is correct, or update to the correct path, e.g.:
// import ErrorAlert from '../../common/ErrorAlert';
// import ErrorAlert from '../../components/common/ErrorAlert';
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
        const response = await profileService.getPublicProfile(username);
        setProfileData(response.data);
        // Record view
        await profileService.recordProfileView(username);
      } catch (err: any) {
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
          title: `${profileData?.fullName}'s Coding Profile`,
          text: `Check out ${profileData?.fullName}'s coding profile on DevPlaza`,
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
    return (solved / total) * 100;
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 70) return 'bg-gradient-to-r from-red-800 to-red-600';
    if (percentage >= 50) return 'bg-gradient-to-r from-red-900 to-red-700';
    return 'bg-gradient-to-r from-red-950 to-red-800';
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;
  if (!profileData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-red-800 to-red-600 rounded-full flex items-center justify-center text-2xl font-bold">
              {profileData.fullName[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-red-200 bg-clip-text text-transparent">
                {profileData.fullName}
              </h1>
              <p className="text-gray-400">@{profileData.username}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>{profileData.viewCount} views</span>
            </div>
            <div className="flex items-center space-x-1">
              <RefreshCw className="w-4 h-4" />
              <span>Last updated: {new Date(profileData.lastRefresh).toLocaleDateString()}</span>
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
            value={profileData.totalQuestions}
            icon={<Code />}
          />
          <StatsCard
            title="Active Days"
            value={profileData.totalActiveDays}
            icon={<BarChart3 />}
          />
          <StatsCard
            title="Contests"
            value={profileData.totalContests}
            icon={<Trophy />}
          />
          <StatsCard
            title="Awards"
            value={profileData.awards}
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
            {profileData.platformStats.map(platform => (
              <PlatformStatCard key={platform.name} {...platform} />
            ))}
          </div>

          {/* DSA Progress */}
          <div className="bg-gradient-to-br from-gray-900 via-red-950 to-black border border-red-900/30 rounded-lg p-6">
            <h3 className="font-semibold mb-4 bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">
              DSA Progress
            </h3>
            {profileData.dsaTopics.map(topic => (
              <TopicProgressBar key={topic.name} {...topic} />
            ))}
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
      {value}
    </p>
  </div>
);

const PlatformStatCard: React.FC<{ name: string; rank: number; maxRank: number }> = ({ name, rank, maxRank }) => (
  <div className="flex items-center justify-between py-2 border-b border-red-900/20">
    <span className="text-gray-300">{name}</span>
    <span className="text-red-400">Rank {rank}</span>
  </div>
);

const TopicProgressBar: React.FC<{ name: string; solved: number; total: number }> = ({ name, solved, total }) => {
  const percentage = getProgressPercentage(solved, total);
    function getProgressColor(percentage: number) {
        if (percentage >= 70) return 'bg-gradient-to-r from-red-800 to-red-600';
        if (percentage >= 50) return 'bg-gradient-to-r from-red-900 to-red-700';
        return 'bg-gradient-to-r from-red-950 to-red-800';
    }
  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-300">{name}</span>
        <span className="text-red-400">{solved}/{total}</span>
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
function getProgressPercentage(solved: number, total: number) {
    if (total === 0) return 0;
    return Math.round((solved / total) * 100);
}

