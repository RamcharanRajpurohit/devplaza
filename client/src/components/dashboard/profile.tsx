import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { profileService, potdService, contestService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Sidebar from './sidepannel';
import DonutChart from './bar';
import {
  Code,
  Trophy,
  Share2,
  Menu,
  UserPlus,
  Calendar,
  ExternalLink
} from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../common/ErrorAlert';
import type EnhancedProfileData from '../../types/enhanceData';
import PlatformCard from './platformcard';
import DifficultyBar from './diifBar';

interface Problem {
  platform: string;
  title: string;
  url: string;
  difficulty?: string;
  tags?: string[];
}

interface Contest {
  platform: string;
  name: string;
  url: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: 'upcoming' | 'ongoing' | 'ended';
}

const CodingProfileDashboard: React.FC = () => {
  const { user, logout, setIsProfileComplet } = useAuth();
  const { username: urlUsername } = useParams<{ username?: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [profileData, setProfileData] = useState<EnhancedProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profileIncomplete, setProfileIncomplete] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [contests, setContests] = useState<Contest[]>([]);
  const [loadingPOTD, setLoadingPOTD] = useState(true);
  const [loadingContests, setLoadingContests] = useState(true);

  // Determine if viewing own profile or someone else's
  const viewingUsername = urlUsername || user?.username;
 const isOwnProfile = !!user && (!urlUsername || urlUsername === user.username);


  useEffect(() => {
    fetchProfileData();
    fetchPOTDs();
    fetchContests();
  }, [viewingUsername]);

  const fetchProfileData = async () => {
    if (!viewingUsername) {
      console.log('Username is missing');
      setError('Username is missing');
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      setRefreshing(true);
      setProfileIncomplete(false);
      const response = await profileService.getPublicProfile(viewingUsername);
      console.log(response);

      setProfileData(response.data);
      if (isOwnProfile) {
        setIsProfileComplet();
      }
      console.log(response.data);
      setError('');
    } catch (err: any) {
      console.log(err);
      if (err.response?.data?.error === "Please complete your profile links first.") {
        setProfileIncomplete(true);
        setError('');
      } else {
        setError(err.response?.data?.message || 'Failed to load profile');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchPOTDs = async () => {
    try {
      const response = await potdService.getTodaysPOTDs();
      setProblems(response.data.problems || []);
    } catch (error) {
      console.error('Error fetching POTDs:', error);
    } finally {
      setLoadingPOTD(false);
    }
  };

  const fetchContests = async () => {
    try {
      const response = await contestService.getTodayContests();
      setContests(response.data.contests || []);
    } catch (error) {
      console.error('Error fetching contests:', error);
    } finally {
      setLoadingContests(false);
    }
  };

  const getPlatformColor = (platform: string): string => {
    const colors: Record<string, string> = {
      leetcode: 'from-yellow-500 to-orange-500',
      geeksforgeeks: 'from-green-500 to-emerald-500',
      naukri: 'from-blue-500 to-indigo-500',
      codeforces: 'from-blue-500 to-cyan-500',
      codechef: 'from-amber-500 to-orange-500',
      atcoder: 'from-purple-500 to-pink-500',
    };
    return colors[platform] || 'from-gray-500 to-gray-600';
  };

  const formatPlatformName = (platform: string): string => {
    const names: Record<string, string> = {
      leetcode: 'LeetCode',
      geeksforgeeks: 'GeeksforGeeks',
      naukri: 'Naukri Code360',
      codeforces: 'Codeforces',
      codechef: 'CodeChef',
      atcoder: 'AtCoder',
    };
    return names[platform] || platform.charAt(0).toUpperCase() + platform.slice(1);
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeUntil = (startTime: string): string => {
    const now = new Date();
    const start = new Date(startTime);
    const diff = start.getTime() - now.getTime();

    if (diff < 0) return 'Started';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `in ${days}d ${hours}h`;
    if (hours > 0) return `in ${hours}h ${minutes}m`;
    return `in ${minutes}m`;
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
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
    const profileUrl = `${window.location.origin}/profile/${viewingUsername}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${profileData?.profile?.name || viewingUsername}'s Coding Profile`,
          text: `Check out ${isOwnProfile ? 'my' : 'this'} coding profile on DevPlaza`,
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

  // Helper function to check if a value exists and is not empty
  const hasValue = (value: any): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim() !== '';
    if (typeof value === 'number') return value > 0;
    if (typeof value === 'object') return Object.keys(value).length > 0;
    return Boolean(value);
  };

  // Helper function to get stats that have values
  const getValidStats = () => {
    const stats = [];
    const overview = profileData?.overview;

    if (hasValue(overview?.totalQuestions)) {
      stats.push({
        title: "Total Questions",
        value: overview?.totalQuestions,
        icon: <Code className="w-4 h-4 sm:w-5 sm:h-5" />,
        color: "from-blue-500 to-blue-400"
      });
    }
    if (hasValue(overview?.totalContests)) {
      stats.push({
        title: "Total Contests",
        value: overview?.totalContests,
        icon: <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />,
        color: "from-purple-500 to-purple-400"
      });
    }

    return stats;
  };

  if (loading) return <LoadingSpinner />;
  
  // Show profile incomplete message for own profile
  if (profileIncomplete && isOwnProfile) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Complete Profile Banner */}
        <div className="max-w-2xl mx-auto mb-8 bg-gradient-to-br from-gray-900 via-red-950 to-black border border-red-800/30 rounded-xl p-8 sm:p-12 text-center shadow-2xl">
          <div className="mb-6">
            <UserPlus className="w-20 h-20 sm:w-24 sm:h-24 mx-auto text-red-400 mb-4" />
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-red-400 to-red-200 bg-clip-text text-transparent">
            Complete Your Profile
          </h2>
          <p className="text-gray-300 text-base sm:text-lg mb-8 max-w-md mx-auto">
            Please complete your profile by adding your coding platform links to start tracking your progress and showcase your achievements.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => navigate('/complete-profile')}
              className="bg-gradient-to-r from-red-600 to-red-500 px-8 py-3 rounded-lg hover:from-red-500 hover:to-red-400 transition-all duration-300 shadow-lg font-semibold text-base sm:text-lg hover:scale-105 transform"
            >
              Complete Profile Now
            </button>
            <button
              onClick={handleLogout}
              className="bg-gray-700 px-8 py-3 rounded-lg hover:bg-gray-600 transition-all duration-300 shadow-lg font-semibold text-base sm:text-lg hover:scale-105 transform"
            >
              Logout
            </button>
          </div>
        </div>

        {/* POTD Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent flex items-center gap-3">
                <Code className="w-7 h-7 text-red-400" />
                Problem of the Day
              </h2>
              <p className="text-gray-400 mt-2">Practice daily problems from various platforms</p>
            </div>
            <Link
              to="/potd"
              className="px-4 py-2 bg-gradient-to-r from-red-800 to-red-700 hover:from-red-700 hover:to-red-600 rounded-lg font-medium transition-all text-sm sm:text-base"
            >
              View All
            </Link>
          </div>

          {loadingPOTD ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-red-400 border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : problems.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-gradient-to-br from-gray-900 via-red-950 to-black border border-red-800/30 rounded-xl">
              <Code className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No problems available today</p>
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {problems.map((problem, index) => (
                <a
                  key={index}
                  href={problem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 w-80 bg-gradient-to-br from-gray-900 via-red-950 to-black border border-red-800/30 rounded-xl p-6 hover:border-red-600/50 transition-all duration-300 hover:scale-105"
                >
                  <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${getPlatformColor(problem.platform)} text-white text-sm font-semibold inline-block mb-3`}>
                    {formatPlatformName(problem.platform)}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                    {problem.title}
                  </h3>
                  {problem.difficulty && (
                    <div className="text-xs text-gray-400 mb-3">
                      Difficulty: <span className="text-red-400">{problem.difficulty}</span>
                    </div>
                  )}
                  {problem.tags && problem.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {problem.tags.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-gray-800/50 border border-gray-700 rounded text-xs text-gray-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Contests Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent flex items-center gap-3">
                <Trophy className="w-7 h-7 text-red-400" />
                Upcoming Contests
              </h2>
              <p className="text-gray-400 mt-2">Compete in coding contests from various platforms</p>
            </div>
            <Link
              to="/contests"
              className="px-4 py-2 bg-gradient-to-r from-red-800 to-red-700 hover:from-red-700 hover:to-red-600 rounded-lg font-medium transition-all text-sm sm:text-base"
            >
              View All
            </Link>
          </div>

          {loadingContests ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-red-400 border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : contests.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-gradient-to-br from-gray-900 via-red-950 to-black border border-red-800/30 rounded-xl">
              <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No contests scheduled today</p>
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {contests.slice(0, 10).map((contest, index) => (
                <a
                  key={index}
                  href={contest.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 w-80 bg-gradient-to-br from-gray-900 via-red-950 to-black border border-red-800/30 rounded-xl p-6 hover:border-red-600/50 transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${getPlatformColor(contest.platform)} text-white text-sm font-semibold`}>
                      {formatPlatformName(contest.platform)}
                    </div>
                    {contest.status === 'ongoing' && (
                      <div className="px-2 py-1 bg-green-500 text-white text-xs rounded-full animate-pulse">
                        LIVE
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3 line-clamp-2">
                    {contest.name}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatTime(contest.startTime)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">Starts {getTimeUntil(contest.startTime)}</div>
                    <ExternalLink className="w-4 h-4 text-red-400" />
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

  if (profileIncomplete && !isOwnProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950 text-white flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-gradient-to-br from-gray-900 via-red-950 to-black border border-red-800/30 rounded-xl p-8 sm:p-12 text-center shadow-2xl">
          <div className="mb-6">
            <UserPlus className="w-20 h-20 sm:w-24 sm:h-24 mx-auto text-red-400 mb-4" />
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-red-400 to-red-200 bg-clip-text text-transparent">
            Profile Not Complete
          </h2>
          <p className="text-gray-300 text-base sm:text-lg mb-8 max-w-md mx-auto">
            This user hasn't completed their profile yet. Check back later to see their coding achievements!
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-red-600 to-red-500 px-8 py-3 rounded-lg hover:from-red-500 hover:to-red-400 transition-all duration-300 shadow-lg font-semibold text-base sm:text-lg hover:scale-105 transform"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (error) return <ErrorAlert message={error} />;
  if (!profileData) return <ErrorAlert message="Profile data not available" />;

  const validStats = getValidStats();
  const hasDSAProblems = hasValue(profileData.problemsSolved?.dsa?.total);
  const hasCPProblems = hasValue(profileData.problemsSolved?.competitiveProgramming?.total);
  const hasPlatforms = hasValue(profileData.platforms) && Object.keys(profileData.platforms).length > 0;
  const hasTopicAnalysis = hasValue(profileData.topicAnalysis) && Object.keys(profileData.topicAnalysis).length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950 text-white">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="md:hidden fixed top-3 left-3 z-50 p-2 sm:p-3 bg-gradient-to-r from-red-800 to-red-600 rounded-lg shadow-lg hover:from-red-700 hover:to-red-500 transition-all duration-300"
      >
        <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {/* Share Profile Button - Fixed in corner */}
      <button
        onClick={handleShareProfile}
        className="fixed top-3 right-3 z-50 p-2 sm:p-3 bg-gradient-to-r from-red-800 to-red-600 rounded-full shadow-lg hover:from-red-700 hover:to-red-500 transition-all duration-300 hover:scale-105"
        title="Share Profile"
      >
        <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {/* Sidebar - Always show, but pass isOwnProfile to control actions */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        profileData={profileData}
        onLogout={handleLogout}
        onShareProfile={handleShareProfile}
        onRefreshProfile={handleRefreshProfile}
        refreshing={refreshing}
        isOwnProfile={isOwnProfile}
      />

      {/* Main Content */}
      <div className="transition-all duration-300 md:ml-80">
        <div className="p-3 sm:p-4 lg:p-6 xl:p-8 pt-16 sm:pt-20 md:pt-8">
          {/* Viewing Banner for other profiles */}
          

          {/* Stats Section - More compact on mobile */}
          {validStats.length > 0 && (
            <div className="mb-6 sm:mb-8">
              <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-1 lg:grid-cols-2">
                {/* DSA Problems Chart - Difficulty Breakdown */}
                {profileData.problemsSolved?.dsa?.total && (
                  <DonutChart
                    total={profileData.problemsSolved.dsa.total.overall}
                    data={[
                      {
                        label: "Easy",
                        value: profileData.problemsSolved.dsa.total.easy,
                        color: "#22c55e",
                        platformBreakdown: [
                          { platform: "LeetCode", value: profileData.problemsSolved.dsa.leetcode.easy },
                          { platform: "GeeksforGeeks", value: profileData.problemsSolved.dsa.gfg.easy },
                          { platform: "Code360", value: profileData.problemsSolved.dsa.code360.easy },
                        ]
                      },
                      {
                        label: "Medium",
                        value: profileData.problemsSolved.dsa.total.medium,
                        color: "#f59e0b",
                        platformBreakdown: [
                          { platform: "LeetCode", value: profileData.problemsSolved.dsa.leetcode.medium },
                          { platform: "GeeksforGeeks", value: profileData.problemsSolved.dsa.gfg.medium },
                          { platform: "Code360", value: profileData.problemsSolved.dsa.code360.medium },
                        ]
                      },
                      {
                        label: "Hard",
                        value: profileData.problemsSolved.dsa.total.hard,
                        color: "#ef4444",
                        platformBreakdown: [
                          { platform: "LeetCode", value: profileData.problemsSolved.dsa.leetcode.hard },
                          { platform: "GeeksforGeeks", value: profileData.problemsSolved.dsa.gfg.hard },
                          { platform: "Code360", value: profileData.problemsSolved.dsa.code360.hard },
                        ]
                      },
                    ]}
                    platformBreakdown={[
                      { platform: "LeetCode", value: profileData.problemsSolved.dsa.leetcode.total },
                      { platform: "GeeksforGeeks", value: profileData.problemsSolved.dsa.gfg.total },
                      { platform: "Code360", value: profileData.problemsSolved.dsa.code360.total },
                    ]}
                    showPlatformBreakdown={true}
                  />
                )}

                {/* Competitive Programming Chart - Platform Breakdown */}
                {profileData.problemsSolved?.competitiveProgramming?.total && (
                  <DonutChart
                    total={profileData.problemsSolved.competitiveProgramming.total}
                    data={[
                      {
                        label: "CodeChef",
                        value: profileData.problemsSolved.competitiveProgramming.codechef,
                        color: "#8b5cf6"
                      },
                      {
                        label: "Codeforces",
                        value: profileData.problemsSolved.competitiveProgramming.codeforces,
                        color: "#3b82f6"
                      },
                    ]}
                    platformBreakdown={[
                      {
                        platform: "CodeChef",
                        value: profileData.problemsSolved.competitiveProgramming.codechef
                      },
                      {
                        platform: "Codeforces",
                        value: profileData.problemsSolved.competitiveProgramming.codeforces
                      },
                    ]}
                    showPlatformBreakdown={true}
                  />
                )}
              </div>
            </div>
          )}

          {/* Main Content Grid */}
          <div className="space-y-6 sm:space-y-8">
            {/* Problems Solved Section */}
            {(hasDSAProblems || hasCPProblems) && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                {hasPlatforms && (
                  <div className="bg-gradient-to-br from-gray-900 via-red-950 to-black border border-red-800/30 rounded-xl p-4 sm:p-6 lg:p-8 shadow-xl">
                    <h3 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold mb-4 sm:mb-6 lg:mb-8 bg-gradient-to-r from-red-400 to-red-200 bg-clip-text text-transparent">
                      Platform Rankings
                    </h3>
                    <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                      {Object.entries(profileData.platforms)
                        .filter(([, platform]) => hasValue(platform.rating) || hasValue(platform.rank))
                        .map(([key, platform]) => (
                          <PlatformCard key={key} platform={platform} />
                        ))}
                    </div>
                  </div>
                )}
                <div className="bg-gradient-to-br from-gray-900 via-red-950 to-black border border-red-800/30 rounded-xl p-4 sm:p-6 lg:p-8 shadow-xl">
                  <h3 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold mb-4 sm:mb-6 lg:mb-8 bg-gradient-to-r from-red-400 to-red-200 bg-clip-text text-transparent">
                    Problems Solved
                  </h3>

                  {/* DSA Problems */}
                  {hasDSAProblems && (
                    <div className="mb-6 sm:mb-8">
                      <h4 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4 lg:mb-6 text-gray-300">
                        Data Structures & Algorithms
                      </h4>
                      <div className="space-y-3 sm:space-y-4">
                        {hasValue(profileData.problemsSolved.dsa.total.easy) && (
                          <DifficultyBar
                            label="Easy"
                            solved={profileData.problemsSolved.dsa.total.easy}
                            color="bg-green-500"
                          />
                        )}
                        {hasValue(profileData.problemsSolved.dsa.total.medium) && (
                          <DifficultyBar
                            label="Medium"
                            solved={profileData.problemsSolved.dsa.total.medium}
                            color="bg-yellow-500"
                          />
                        )}
                        {hasValue(profileData.problemsSolved.dsa.total.hard) && (
                          <DifficultyBar
                            label="Hard"
                            solved={profileData.problemsSolved.dsa.total.hard}
                            color="bg-red-500"
                          />
                        )}
                      </div>
                      <div className="text-center mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-lg">
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">
                          {profileData.problemsSolved.dsa.total.overall}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-400 mt-1">Total DSA Problems</div>
                      </div>
                    </div>
                  )}

                  {/* Competitive Programming */}
                  {hasCPProblems && (
                    <div>
                      <h4 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4 lg:mb-6 text-gray-300">
                        Competitive Programming
                      </h4>
                      <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                        {hasValue(profileData.problemsSolved.competitiveProgramming.codechef) && (
                          <div className="flex justify-between items-center p-2 sm:p-3 bg-gradient-to-r from-gray-800/30 to-gray-900/30 rounded-lg">
                            <span className="text-gray-400 text-sm sm:text-base">CodeChef:</span>
                            <span className="text-red-400 font-semibold text-sm sm:text-base">{profileData.problemsSolved.competitiveProgramming.codechef}</span>
                          </div>
                        )}
                        {hasValue(profileData.problemsSolved.competitiveProgramming.codeforces) && (
                          <div className="flex justify-between items-center p-2 sm:p-3 bg-gradient-to-r from-gray-800/30 to-gray-900/30 rounded-lg">
                            <span className="text-gray-400 text-sm sm:text-base">Codeforces:</span>
                            <span className="text-red-400 font-semibold text-sm sm:text-base">{profileData.problemsSolved.competitiveProgramming.codeforces}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-center p-3 sm:p-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-lg">
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">
                          {profileData.problemsSolved.competitiveProgramming.total}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-400 mt-1">Total CP Problems</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Topic Analysis */}
            {hasTopicAnalysis && (
              <div className="bg-gradient-to-br from-gray-900 via-red-950 to-black border border-red-800/30 rounded-xl p-4 sm:p-6 lg:p-8 shadow-xl">
                <h3 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold mb-4 sm:mb-6 lg:mb-8 bg-gradient-to-r from-red-400 to-red-200 bg-clip-text text-transparent">
                  Topic Analysis
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                  {Object.entries(profileData.topicAnalysis)
                    .filter(([, count]) => hasValue(count))
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 12)
                    .map(([topic, count]) => (
                      <div key={topic} className="flex justify-between items-center p-3 sm:p-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-lg hover:from-gray-800/70 hover:to-gray-900/70 transition-all duration-300">
                        <span className="text-gray-300 capitalize text-xs sm:text-sm lg:text-base font-medium truncate mr-2 sm:mr-3">
                          {topic.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="text-red-400 font-bold text-xs sm:text-sm lg:text-base flex-shrink-0 bg-red-400/10 px-2 py-1 rounded">
                          {count}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!validStats.length && !hasDSAProblems && !hasCPProblems && !hasPlatforms && !hasTopicAnalysis && (
              <div className="bg-gradient-to-br from-gray-900 via-red-950 to-black border border-red-800/30 rounded-xl p-6 sm:p-8 lg:p-12 text-center shadow-xl">
                <div className="text-4xl sm:text-5xl lg:text-6xl xl:text-8xl mb-4 sm:mb-6">🚀</div>
                <h3 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-red-400 to-red-200 bg-clip-text text-transparent">
                  {isOwnProfile ? 'Ready to Start Coding?' : 'No Data Available'}
                </h3>
                <p className="text-gray-400 mb-6 sm:mb-8 text-sm sm:text-base lg:text-lg max-w-md mx-auto">
                  {isOwnProfile
                    ? 'Your coding journey begins here. Start solving problems to see your progress!'
                    : 'This user hasn\'t solved any problems yet.'}
                </p>
                {isOwnProfile && (
                  <button
                    onClick={() => navigate('/complete-profile')}
                    className="bg-gradient-to-r from-red-600 to-red-500 px-6 sm:px-8 py-2 sm:py-3 rounded-lg hover:from-red-500 hover:to-red-400 transition-all duration-300 shadow-lg font-medium text-sm sm:text-base lg:text-lg"
                  >
                    Complete Profile
                  </button>
                )}
              </div>
            )}

            {/* POTD Section */}
            <div className="bg-gradient-to-br from-gray-900 via-red-950 to-black border border-red-800/30 rounded-xl p-4 sm:p-6 lg:p-8 shadow-xl">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div>
                  <h3 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold bg-gradient-to-r from-red-400 to-red-200 bg-clip-text text-transparent flex items-center gap-2 sm:gap-3">
                    <Code className="w-5 h-5 sm:w-6 sm:h-6" />
                    Problem of the Day
                  </h3>
                  <p className="text-gray-400 mt-1 sm:mt-2 text-xs sm:text-sm">Practice daily problems from various platforms</p>
                </div>
                <Link
                  to="/potd"
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-red-800 to-red-700 hover:from-red-700 hover:to-red-600 rounded-lg font-medium transition-all text-xs sm:text-sm"
                >
                  View All
                </Link>
              </div>

              {loadingPOTD ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="animate-spin w-6 h-6 sm:w-8 sm:h-8 border-4 border-red-400 border-t-transparent rounded-full mx-auto"></div>
                </div>
              ) : problems.length === 0 ? (
                <div className="text-center py-8 sm:py-12 text-gray-500">
                  <Code className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                  <p className="text-sm sm:text-base">No problems available today</p>
                </div>
              ) : (
                <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-3 sm:pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {problems.map((problem, index) => (
                    <a
                      key={index}
                      href={problem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 w-72 sm:w-80 bg-gradient-to-br from-black via-gray-900 to-red-950 border border-red-800/20 rounded-xl p-4 sm:p-6 hover:border-red-600/50 transition-all duration-300 hover:scale-105"
                    >
                      <div className={`px-2.5 py-1 sm:px-3 sm:py-1 rounded-full bg-gradient-to-r ${getPlatformColor(problem.platform)} text-white text-xs sm:text-sm font-semibold inline-block mb-2 sm:mb-3`}>
                        {formatPlatformName(problem.platform)}
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-white mb-1.5 sm:mb-2 line-clamp-2">
                        {problem.title}
                      </h3>
                      {problem.difficulty && (
                        <div className="text-xs text-gray-400 mb-2 sm:mb-3">
                          Difficulty: <span className="text-red-400">{problem.difficulty}</span>
                        </div>
                      )}
                      {problem.tags && problem.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {problem.tags.slice(0, 3).map((tag, i) => (
                            <span
                              key={i}
                              className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-gray-800/50 border border-gray-700 rounded text-xs text-gray-300"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Contests Section */}
            <div className="bg-gradient-to-br from-gray-900 via-red-950 to-black border border-red-800/30 rounded-xl p-4 sm:p-6 lg:p-8 shadow-xl">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div>
                  <h3 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold bg-gradient-to-r from-red-400 to-red-200 bg-clip-text text-transparent flex items-center gap-2 sm:gap-3">
                    <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
                    Upcoming Contests
                  </h3>
                  <p className="text-gray-400 mt-1 sm:mt-2 text-xs sm:text-sm">Compete in coding contests from various platforms</p>
                </div>
                <Link
                  to="/contests"
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-red-800 to-red-700 hover:from-red-700 hover:to-red-600 rounded-lg font-medium transition-all text-xs sm:text-sm"
                >
                  View All
                </Link>
              </div>

              {loadingContests ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="animate-spin w-6 h-6 sm:w-8 sm:h-8 border-4 border-red-400 border-t-transparent rounded-full mx-auto"></div>
                </div>
              ) : contests.length === 0 ? (
                <div className="text-center py-8 sm:py-12 text-gray-500">
                  <Trophy className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                  <p className="text-sm sm:text-base">No contests scheduled today</p>
                </div>
              ) : (
                <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-3 sm:pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {contests.slice(0, 10).map((contest, index) => (
                    <a
                      key={index}
                      href={contest.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 w-72 sm:w-80 bg-gradient-to-br from-black via-gray-900 to-red-950 border border-red-800/20 rounded-xl p-4 sm:p-6 hover:border-red-600/50 transition-all duration-300 hover:scale-105"
                    >
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <div className={`px-2.5 py-1 sm:px-3 sm:py-1 rounded-full bg-gradient-to-r ${getPlatformColor(contest.platform)} text-white text-xs sm:text-sm font-semibold`}>
                          {formatPlatformName(contest.platform)}
                        </div>
                        {contest.status === 'ongoing' && (
                          <div className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-green-500 text-white text-xs rounded-full animate-pulse">
                            LIVE
                          </div>
                        )}
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-white mb-2 sm:mb-3 line-clamp-2">
                        {contest.name}
                      </h3>
                      <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-400 mb-1.5 sm:mb-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span>{formatTime(contest.startTime)}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">Starts {getTimeUntil(contest.startTime)}</div>
                        <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" />
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodingProfileDashboard;