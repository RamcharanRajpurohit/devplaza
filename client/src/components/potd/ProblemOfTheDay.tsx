import React, { useEffect, useState } from 'react';
import { potdService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Code, ExternalLink, RefreshCw, Calendar, TrendingUp } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import { Link } from 'react-router-dom';

interface Problem {
  platform: string;
  title: string;
  url: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  tags?: string[];
}

interface POTDResponse {
  success: boolean;
  date: string;
  count: number;
  problems: Problem[];
}

const ProblemOfTheDay: React.FC = () => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchPOTDs();
  }, []);

  const fetchPOTDs = async () => {
    try {
      setLoading(true);
      const response = await potdService.getTodaysPOTDs();
      const data: POTDResponse = response.data;
      setProblems(data.problems || []);
    } catch (error: any) {
      console.error('Error fetching POTDs:', error);
      showToast('Failed to load problems of the day', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await potdService.refreshPOTDs();
      await fetchPOTDs();
      showToast('Problems refreshed successfully!', 'success');
    } catch (error) {
      showToast('Failed to refresh problems', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  const getPlatformColor = (platform: string): string => {
    const colors: Record<string, string> = {
      leetcode: 'from-yellow-500 to-orange-500',
      geeksforgeeks: 'from-green-500 to-emerald-500',
      naukri: 'from-blue-500 to-indigo-500',
      takeuforward: 'from-purple-500 to-pink-500',
      interviewbit: 'from-red-500 to-rose-500',
      codechef: 'from-amber-500 to-yellow-500',
      codeforces: 'from-cyan-500 to-blue-500',
    };
    return colors[platform] || 'from-gray-500 to-gray-600';
  };

  const getDifficultyColor = (difficulty?: string): string => {
    if (!difficulty) return 'bg-gray-500';
    const colors: Record<string, string> = {
      Easy: 'bg-green-500',
      Medium: 'bg-yellow-500',
      Hard: 'bg-red-500',
    };
    return colors[difficulty] || 'bg-gray-500';
  };

  const formatPlatformName = (platform: string): string => {
    const names: Record<string, string> = {
      leetcode: 'LeetCode',
      geeksforgeeks: 'GeeksforGeeks',
      naukri: 'Naukri Code360',
      takeuforward: 'TakeUForward',
      interviewbit: 'InterviewBit',
      codechef: 'CodeChef',
      codeforces: 'Codeforces',
    };
    return names[platform] || platform.charAt(0).toUpperCase() + platform.slice(1);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950 text-white">
      {/* Header */}
      <div className="border-b border-red-900/30 bg-black/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent hover:from-red-300 hover:to-red-200 transition-all">
                DevPlaza
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/auth/signup"
                className="px-4 py-2 bg-gradient-to-r from-red-800 to-red-700 hover:from-red-700 hover:to-red-600 rounded-lg font-medium transition-all"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Title Section */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Code className="w-8 h-8 sm:w-10 sm:h-10 text-red-400" />
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Problem of the Day
            </h1>
          </div>
          <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto mb-6">
            Solve daily challenges from top coding platforms - all in one place!
          </p>

          {/* Stats Bar */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm sm:text-base">
            <div className="flex items-center gap-2 bg-gradient-to-r from-gray-800/50 to-gray-900/50 px-4 py-2 rounded-lg">
              <Calendar className="w-4 h-4 text-red-400" />
              <span className="text-gray-300">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-gradient-to-r from-gray-800/50 to-gray-900/50 px-4 py-2 rounded-lg">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-gray-300">{problems.length} Problems Today</span>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 bg-gradient-to-r from-red-800 to-red-700 hover:from-red-700 hover:to-red-600 disabled:from-gray-700 disabled:to-gray-600 px-4 py-2 rounded-lg transition-all font-medium"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Problems Grid */}
        {problems.length === 0 ? (
          <div className="text-center py-12">
            <Code className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-gray-600 mb-4" />
            <h3 className="text-xl sm:text-2xl font-bold text-gray-400 mb-2">No Problems Available</h3>
            <p className="text-gray-500 mb-6">Check back later or try refreshing</p>
            <button
              onClick={handleRefresh}
              className="px-6 py-3 bg-gradient-to-r from-red-800 to-red-700 hover:from-red-700 hover:to-red-600 rounded-lg font-medium transition-all"
            >
              Refresh Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {problems.map((problem, index) => (
              <a
                key={index}
                href={problem.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-gradient-to-br from-gray-900 via-red-950 to-black border border-red-800/30 rounded-xl p-6 hover:border-red-600/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-red-900/20"
              >
                {/* Platform Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${getPlatformColor(problem.platform)} text-white text-xs sm:text-sm font-semibold`}>
                    {formatPlatformName(problem.platform)}
                  </div>
                  {problem.difficulty && (
                    <div className={`px-2 py-1 rounded ${getDifficultyColor(problem.difficulty)} text-white text-xs font-medium`}>
                      {problem.difficulty}
                    </div>
                  )}
                </div>

                {/* Problem Title */}
                <h3 className="text-lg sm:text-xl font-bold text-white mb-3 group-hover:text-red-300 transition-colors line-clamp-2">
                  {problem.title}
                </h3>

                {/* Tags */}
                {problem.tags && problem.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {problem.tags.slice(0, 3).map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-gray-800/50 border border-gray-700 rounded text-xs text-gray-300"
                      >
                        {tag}
                      </span>
                    ))}
                    {problem.tags.length > 3 && (
                      <span className="px-2 py-1 text-xs text-gray-400">
                        +{problem.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Solve Button */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-800">
                  <span className="text-red-400 font-medium text-sm group-hover:text-red-300">
                    Solve Problem
                  </span>
                  <ExternalLink className="w-4 h-4 text-red-400 group-hover:text-red-300 group-hover:translate-x-1 transition-transform" />
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Info Footer */}
        <div className="mt-12 p-6 bg-gradient-to-r from-gray-900/50 to-gray-800/50 border border-gray-700 rounded-xl text-center">
          <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
            Want to track your progress?
          </h3>
          <p className="text-gray-400 mb-4 text-sm sm:text-base">
            Sign up to save your solved problems and showcase your coding journey
          </p>
          <Link
            to="/auth/signup"
            className="inline-block px-8 py-3 bg-gradient-to-r from-red-800 to-red-700 hover:from-red-700 hover:to-red-600 rounded-lg font-medium transition-all hover:scale-105"
          >
            Get Started Free
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProblemOfTheDay;
