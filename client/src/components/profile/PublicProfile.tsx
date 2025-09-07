import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { profileService } from '../../services/api';
import type { ProfileData } from '../../types/profile';
import { 
  User, MapPin, Building, Eye, RefreshCw, Trophy, Star, ChevronRight, 
  BarChart3, Code, Target, Award, Share2, Calendar, Users, GitBranch,
  Zap, Flame, TrendingUp, Clock, Medal
} from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../../common/ErrorAlert';
import { useToast } from '../../context/ToastContext';

interface EnhancedProfileData {
  profile: {
    name: string;
    username: string;
    bio: string;
    avatar: string;
    location: string;
    institute: string;
    graduationYear: number;
    isVerified: boolean;
    isPublic: boolean;
    profileViews: number;
    followers: number;
    following: number;
    lastRefresh: string;
    joinedDate: string;
  };
  overview: {
    totalQuestions: number;
    totalActiveDays: number;
    totalContests: number;
    maxStreak: number;
    currentStreak: number;
    totalSubmissions: number;
    globalRank: {
      score: number;
      position: number;
    };
  };
  problemsSolved: {
    fundamentals: {
      cfg: number;
      total: number;
    };
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
      rank?: string | number;
      totalSolved: number;
      easySolved?: number;
      mediumSolved?: number;
      hardSolved?: number;
      contestsAttended?: number;
      contestRating?: number;
      globalRanking?: number;
      topPercentage?: number;
      score?: number;
      monthlyScore?: number;
      instituteRank?: number;
      longestStreak?: number;
      userLevel?: number;
      userLevelName?: string;
      userExp?: number;
      followers?: number;
      repos?: number;
    };
  };
  contestRankings: {
    [key: string]: {
      rating: number;
      maxRating?: number;
      globalRank?: number;
      rank?: string;
      attended: number;
    };
  };
  awards: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    earnedDate: string;
  }>;
  topicAnalysis: {
    [key: string]: number;
  };
  recentActivity: Array<{
    platform: string;
    problemName: string;
    difficulty: string;
    status: string;
    language: string;
    timestamp: string;
  }>;
  skills: {
    languages: string[];
    technologies: string[];
    algorithms: string[];
    concepts: string[];
  };
}

const PublicProfile: React.FC = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [profileData, setProfileData] = useState<EnhancedProfileData | null>(null);
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
          title: `${profileData?.profile?.name || 'User'}'s Coding Profile`,
          text: `Check out ${profileData?.profile?.name || 'this user'}'s coding profile on DevPlaza`,
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
    if (percentage >= 70) return 'bg-gradient-to-r from-green-500 to-green-400';
    if (percentage >= 50) return 'bg-gradient-to-r from-yellow-500 to-yellow-400';
    return 'bg-gradient-to-r from-red-500 to-red-400';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 2100) return 'text-red-400';
    if (rating >= 1900) return 'text-purple-400';
    if (rating >= 1600) return 'text-blue-400';
    if (rating >= 1400) return 'text-cyan-400';
    if (rating >= 1200) return 'text-green-400';
    return 'text-gray-400';
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;
  if (!profileData) return <ErrorAlert message="Profile data not available" />;

  const { profile, overview, problemsSolved, platforms, contestRankings, awards, topicAnalysis, recentActivity, skills } = profileData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-gradient-to-br from-gray-900 via-red-950 to-black border border-red-900/30 rounded-xl p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <img 
                  src={profile.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.name}`}
                  alt={profile.name}
                  className="w-20 h-20 rounded-full border-2 border-red-400"
                  onError={(e) => {
                    e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${profile.name}`;
                  }}
                />
                {profile.isVerified && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <Star className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-red-200 bg-clip-text text-transparent">
                  {profile.name}
                </h1>
                <p className="text-gray-400 text-lg">@{profile.username}</p>
                {profile.bio && (
                  <p className="text-gray-300 mt-2 max-w-2xl">{profile.bio}</p>
                )}
                <div className="flex items-center space-x-4 mt-3 text-sm text-gray-400">
                  {profile.location && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  {profile.institute && (
                    <div className="flex items-center space-x-1">
                      <Building className="w-4 h-4" />
                      <span>{profile.institute}</span>
                    </div>
                  )}
                  {profile.graduationYear && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Class of {profile.graduationYear}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end space-y-2 text-sm text-gray-400">
              <div className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>{profile.profileViews || 0} views</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{profile.followers || 0} followers</span>
              </div>
              <div className="flex items-center space-x-1">
                <RefreshCw className="w-4 h-4" />
                <span>Updated {new Date(profile.lastRefresh).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatsCard
            title="Total Questions"
            value={overview.totalQuestions}
            icon={<Code className="w-5 h-5" />}
            color="from-blue-500 to-blue-400"
          />
          <StatsCard
            title="Active Days"
            value={overview.totalActiveDays}
            icon={<Calendar className="w-5 h-5" />}
            color="from-green-500 to-green-400"
          />
          <StatsCard
            title="Max Streak"
            value={overview.maxStreak}
            icon={<Flame className="w-5 h-5" />}
            color="from-orange-500 to-orange-400"
          />
          <StatsCard
            title="Global Rank"
            value={overview.globalRank?.position || 0}
            icon={<Trophy className="w-5 h-5" />}
            color="from-yellow-500 to-yellow-400"
          />
        </div>

        {/* Problems Solved Breakdown */}
        <div className="bg-gradient-to-br from-gray-900 via-red-950 to-black border border-red-900/30 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-6 bg-gradient-to-r from-red-400 to-red-200 bg-clip-text text-transparent">
            Problems Solved
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* DSA Problems */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-300">Data Structures & Algorithms</h3>
              <div className="space-y-3">
                <DifficultyBar label="Easy" solved={problemsSolved.dsa.easy} color="bg-green-500" />
                <DifficultyBar label="Medium" solved={problemsSolved.dsa.medium} color="bg-yellow-500" />
                <DifficultyBar label="Hard" solved={problemsSolved.dsa.hard} color="bg-red-500" />
              </div>
              <div className="text-sm text-gray-400">
                Total: {problemsSolved.dsa.total} problems
              </div>
            </div>

            {/* Competitive Programming */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-300">Competitive Programming</h3>
              <div className="space-y-3">
                <PlatformBar label="CodeChef" solved={problemsSolved.competitiveProgramming.codechef} />
                <PlatformBar label="Codeforces" solved={problemsSolved.competitiveProgramming.codeforces} />
              </div>
              <div className="text-sm text-gray-400">
                Total: {problemsSolved.competitiveProgramming.total} problems
              </div>
            </div>

            {/* Topic Analysis */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-300">Top Topics</h3>
              <div className="space-y-2">
                {Object.entries(topicAnalysis)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 6)
                  .map(([topic, count]) => (
                    <div key={topic} className="flex justify-between items-center text-sm">
                      <span className="text-gray-300 capitalize">{topic.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="text-red-400 font-medium">{count}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Platform Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(platforms).map(([platformKey, platform]) => (
            <PlatformCard key={platformKey} platform={platform} />
          ))}
        </div>

        {/* Awards */}
        {awards && awards.length > 0 && (
          <div className="bg-gradient-to-br from-gray-900 via-red-950 to-black border border-red-900/30 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-6 bg-gradient-to-r from-red-400 to-red-200 bg-clip-text text-transparent">
              Achievements
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {awards.map((award, index) => (
                <AwardCard key={award.id || index} award={award} />
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {recentActivity && recentActivity.length > 0 && (
          <div className="bg-gradient-to-br from-gray-900 via-red-950 to-black border border-red-900/30 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-6 bg-gradient-to-r from-red-400 to-red-200 bg-clip-text text-transparent">
              Recent Activity
            </h2>
            <div className="space-y-3">
              {recentActivity.slice(0, 10).map((activity, index) => (
                <ActivityItem key={index} activity={activity} />
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        <div className="bg-gradient-to-br from-gray-900 via-red-950 to-black border border-red-900/30 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-6 bg-gradient-to-r from-red-400 to-red-200 bg-clip-text text-transparent">
            Skills & Technologies
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <SkillCategory title="Languages" skills={skills.languages} />
            <SkillCategory title="Technologies" skills={skills.technologies} />
            <SkillCategory title="Algorithms" skills={skills.algorithms} />
            <SkillCategory title="Concepts" skills={skills.concepts} />
          </div>
        </div>

        {/* Share Button */}
        <button 
          onClick={handleShare}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-red-800 to-red-600 p-4 rounded-full shadow-lg hover:from-red-700 hover:to-red-500 transition-all duration-300 z-50"
        >
          <Share2 className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

// Helper Components
const StatsCard: React.FC<{ 
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

const DifficultyBar: React.FC<{ label: string; solved: number; color: string }> = ({ label, solved, color }) => (
  <div className="flex items-center justify-between">
    <span className="text-gray-300 text-sm w-16">{label}</span>
    <div className="flex-1 mx-3 bg-gray-800 rounded-full h-2">
      <div 
        className={`${color} rounded-full h-2 transition-all duration-300`}
        style={{ width: `${Math.min(100, (solved / 100) * 100)}%` }}
      />
    </div>
    <span className="text-gray-400 text-sm w-8">{solved}</span>
  </div>
);

const PlatformBar: React.FC<{ label: string; solved: number }> = ({ label, solved }) => (
  <div className="flex items-center justify-between">
    <span className="text-gray-300 text-sm">{label}</span>
    <span className="text-red-400 font-medium">{solved}</span>
  </div>
);

const PlatformCard: React.FC<{ platform: any }> = ({ platform }) => (
  <div className="bg-gradient-to-br from-gray-900 via-red-950 to-black border border-red-900/30 rounded-lg p-6">
    <h3 className="font-semibold mb-4 bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">
      {platform.name}
    </h3>
    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-gray-400">Handle:</span>
        <span className="text-gray-300">{platform.handle}</span>
      </div>
      {platform.rating && (
        <div className="flex justify-between">
          <span className="text-gray-400">Rating:</span>
          <span className={`font-medium ${getRatingColor(platform.rating)}`}>
            {platform.rating}
          </span>
        </div>
      )}
      {platform.totalSolved && (
        <div className="flex justify-between">
          <span className="text-gray-400">Solved:</span>
          <span className="text-red-400 font-medium">{platform.totalSolved}</span>
        </div>
      )}
      {platform.contestsAttended !== undefined && (
        <div className="flex justify-between">
          <span className="text-gray-400">Contests:</span>
          <span className="text-gray-300">{platform.contestsAttended}</span>
        </div>
      )}
    </div>
  </div>
);

const AwardCard: React.FC<{ award: any }> = ({ award }) => (
  <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-red-900/20 rounded-lg p-4">
    <div className="flex items-center space-x-3">
      <span className="text-2xl">{award.icon}</span>
      <div>
        <h4 className="font-semibold text-gray-200">{award.title}</h4>
        <p className="text-gray-400 text-xs">{award.description}</p>
        <p className="text-gray-500 text-xs mt-1">
          {new Date(award.earnedDate).toLocaleDateString()}
        </p>
      </div>
    </div>
  </div>
);

const ActivityItem: React.FC<{ activity: any }> = ({ activity }) => (
  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-lg">
    <div className="flex items-center space-x-3">
      <div className={`w-2 h-2 rounded-full ${
        activity.status === 'Solved' ? 'bg-green-400' : 'bg-red-400'
      }`} />
      <div>
        <p className="text-gray-300 font-medium">{activity.problemName}</p>
        <p className="text-gray-500 text-xs">
          {activity.platform} • {activity.language}
        </p>
      </div>
    </div>
    <div className="text-right">
      <p className={`text-sm font-medium ${getDifficultyColor(activity.difficulty)}`}>
        {activity.difficulty}
      </p>
      <p className="text-gray-500 text-xs">
        {new Date(activity.timestamp).toLocaleDateString()}
      </p>
    </div>
  </div>
);

const SkillCategory: React.FC<{ title: string; skills: string[] }> = ({ title, skills }) => (
  <div>
    <h4 className="font-semibold text-gray-300 mb-3">{title}</h4>
    <div className="space-y-2">
      {skills && skills.length > 0 ? (
        skills.map((skill, index) => (
          <span
            key={index}
            className="inline-block bg-gradient-to-r from-red-900/30 to-red-800/30 text-red-300 text-xs px-2 py-1 rounded-full mr-2 mb-2"
          >
            {skill}
          </span>
        ))
      ) : (
        <p className="text-gray-500 text-sm">No skills listed</p>
      )}
    </div>
  </div>
);

// Helper function (move outside component)
const getRatingColor = (rating: number): string => {
  if (rating >= 2100) return 'text-red-400';
  if (rating >= 1900) return 'text-purple-400';
  if (rating >= 1600) return 'text-blue-400';
  if (rating >= 1400) return 'text-cyan-400';
  if (rating >= 1200) return 'text-green-400';
  return 'text-gray-400';
};

// Helper function (move outside component)
const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty.toLowerCase()) {
    case 'easy': return 'text-green-400';
    case 'medium': return 'text-yellow-400';
    case 'hard': return 'text-red-400';
    default: return 'text-gray-400';
  }
};

export default PublicProfile;