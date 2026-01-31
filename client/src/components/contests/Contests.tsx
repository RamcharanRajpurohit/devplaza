import React, { useEffect, useState } from 'react';
import { contestService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Trophy, Calendar, Clock, ExternalLink, RefreshCw, List, CalendarDays } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import { Link } from 'react-router-dom';

interface Contest {
  platform: string;
  name: string;
  url: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: 'upcoming' | 'ongoing' | 'ended';
}

interface ContestResponse {
  success: boolean;
  count: number;
  contests: Contest[];
}

interface DayContests {
  date: Date;
  dayName: string;
  dateStr: string;
  contests: Contest[];
}

const Contests: React.FC = () => {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming'>('upcoming');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const { showToast } = useToast();

  useEffect(() => {
    fetchContests();
  }, [filter]);

  const fetchContests = async () => {
    try {
      setLoading(true);
      const response = filter === 'today'
        ? await contestService.getTodayContests()
        : await contestService.getUpcomingContests();

      const data: ContestResponse = response.data;
      setContests(data.contests || []);
    } catch (error: any) {
      console.error('Error fetching contests:', error);
      showToast('Failed to load contests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await contestService.refreshContests();
      await fetchContests();
      showToast('Contests refreshed successfully!', 'success');
    } catch (error) {
      showToast('Failed to refresh contests', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  const getPlatformColor = (platform: string): string => {
    const colors: Record<string, string> = {
      codeforces: 'from-blue-500 to-cyan-500',
      codechef: 'from-amber-500 to-orange-500',
      leetcode: 'from-yellow-500 to-orange-500',
      atcoder: 'from-purple-500 to-pink-500',
      naukri: 'from-indigo-500 to-blue-500',
    };
    return colors[platform] || 'from-gray-500 to-gray-600';
  };

  const formatPlatformName = (platform: string): string => {
    const names: Record<string, string> = {
      codeforces: 'Codeforces',
      codechef: 'CodeChef',
      leetcode: 'LeetCode',
      atcoder: 'AtCoder',
      naukri: 'Naukri Code360',
    };
    return names[platform] || platform.charAt(0).toUpperCase() + platform.slice(1);
  };

  const formatDate = (dateString: string): string => {
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

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const groupContestsByDay = (): DayContests[] => {
    const grouped: { [key: string]: DayContests } = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Initialize next 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateKey = date.toISOString().split('T')[0];

      grouped[dateKey] = {
        date: new Date(date),
        dayName: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short' }),
        dateStr: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        contests: [],
      };
    }

    // Group contests
    contests.forEach((contest) => {
      const contestDate = new Date(contest.startTime);
      contestDate.setHours(0, 0, 0, 0);
      const dateKey = contestDate.toISOString().split('T')[0];

      if (grouped[dateKey]) {
        grouped[dateKey].contests.push(contest);
      }
    });

    return Object.values(grouped);
  };

  const getContestPosition = (startTime: string): number => {
    const date = new Date(startTime);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return hours + minutes / 60; // Returns hour as decimal (e.g., 14.5 for 2:30 PM)
  };

  const getContestHeight = (duration: number): number => {
    const hours = duration / 3600; // Convert seconds to hours
    return Math.max(hours * 20, 18); // Minimum 18px height, 20px per hour
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
              <Link to="/potd" className="px-4 py-2 text-gray-300 hover:text-red-400 transition-colors">
                Problem of the Day
              </Link>
              <Link to="/auth/signup" className="px-4 py-2 bg-gradient-to-r from-red-800 to-red-700 hover:from-red-700 hover:to-red-600 rounded-lg font-medium transition-all">
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
            <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-red-400" />
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Coding Contests
            </h1>
          </div>
          <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto mb-6">
            All upcoming coding contests from Codeforces, CodeChef, LeetCode, AtCoder, Naukri Code360!
          </p>

          {/* Filter Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
            <div className="flex gap-2 bg-gray-800/50 p-1 rounded-lg">
              <button
                onClick={() => setFilter('today')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === 'today'
                    ? 'bg-red-700 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setFilter('upcoming')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === 'upcoming'
                    ? 'bg-red-700 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                Upcoming (7 Days)
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2 bg-gray-800/50 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'list'
                    ? 'bg-red-700 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <List className="w-4 h-4" />
                List
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'calendar'
                    ? 'bg-red-700 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <CalendarDays className="w-4 h-4" />
                Calendar
              </button>
            </div>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 bg-gradient-to-r from-red-800 to-red-700 hover:from-red-700 hover:to-red-600 disabled:from-gray-700 disabled:to-gray-600 px-4 py-2 rounded-lg transition-all font-medium text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>{contests.length} Contest{contests.length !== 1 ? 's' : ''} Found</span>
          </div>
        </div>

        {/* Contests Display */}
        {contests.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-gray-600 mb-4" />
            <h3 className="text-xl sm:text-2xl font-bold text-gray-400 mb-2">No Contests Found</h3>
            <p className="text-gray-500 mb-6">Check back later or try refreshing</p>
            <button
              onClick={handleRefresh}
              className="px-6 py-3 bg-gradient-to-r from-red-800 to-red-700 hover:from-red-700 hover:to-red-600 rounded-lg font-medium transition-all"
            >
              Refresh Now
            </button>
          </div>
        ) : viewMode === 'list' ? (
          /* List View */
          <div className="space-y-4">
            {contests.map((contest, index) => (
              <a
                key={index}
                href={contest.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block bg-gradient-to-br from-gray-900 via-red-950 to-black border border-red-800/30 rounded-xl p-6 hover:border-red-600/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-red-900/20"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {/* Left: Contest Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${getPlatformColor(contest.platform)} text-white text-xs sm:text-sm font-semibold`}>
                        {formatPlatformName(contest.platform)}
                      </div>
                      {contest.status === 'ongoing' && (
                        <div className="px-2 py-1 bg-green-500 text-white text-xs rounded-full animate-pulse">
                          LIVE
                        </div>
                      )}
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-red-300 transition-colors">
                      {contest.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(contest.startTime)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatDuration(contest.duration)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Time Until */}
                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-right">
                      <div className="text-xs text-gray-500 uppercase mb-1">Starts</div>
                      <div className="text-lg sm:text-xl font-bold text-red-400">
                        {getTimeUntil(contest.startTime)}
                      </div>
                    </div>
                    <ExternalLink className="w-5 h-5 text-red-400 group-hover:text-red-300 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        ) : (
          /* Calendar Grid View - 7 columns with time slots */
          <div className="bg-gradient-to-br from-gray-900 via-red-950 to-black border border-red-800/30 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <div className="min-w-[600px]">
                {/* Header Row - Day Names */}
                <div className="grid grid-cols-8 border-b border-red-800/30 bg-black/40">
                  <div className="p-0.5 text-center text-[9px] font-semibold text-gray-400 w-8">Time</div>
                  {groupContestsByDay().map((day, index) => (
                    <div key={index} className="p-0.5 text-center border-l border-red-800/30">
                      <div className="text-[9px] font-bold text-white truncate">{day.dayName}</div>
                      <div className="text-[8px] text-gray-400 truncate">{day.dateStr}</div>
                    </div>
                  ))}
                </div>

                {/* Time Grid */}
                <div className="grid grid-cols-8 relative">
                  {/* Time Column */}
                  <div className="border-r border-red-800/30 w-8">
                    {Array.from({ length: 12 }, (_, index) => {
                      const hour = index === 0 ? 12 : index;
                      return (
                        <div
                          key={index}
                          className="h-5 border-b border-red-800/20 px-0 text-[7px] text-gray-500 text-center leading-5"
                        >
                          {hour}A
                        </div>
                      );
                    })}
                    {Array.from({ length: 12 }, (_, index) => {
                      const hour = index === 0 ? 12 : index;
                      return (
                        <div
                          key={index + 12}
                          className="h-5 border-b border-red-800/20 px-0 text-[7px] text-gray-500 text-center leading-5"
                        >
                          {hour}P
                        </div>
                      );
                    })}
                  </div>

                  {/* Day Columns */}
                  {groupContestsByDay().map((day, dayIndex) => (
                    <div key={dayIndex} className="relative border-l border-red-800/30">
                      {/* Hour lines */}
                      {Array.from({ length: 24 }, (_, hour) => (
                        <div
                          key={hour}
                          className="h-5 border-b border-red-800/20"
                        ></div>
                      ))}

                      {/* Contest Slabs */}
                      {day.contests.map((contest, contestIndex) => {
                        const position = getContestPosition(contest.startTime);
                        const height = getContestHeight(contest.duration);
                        return (
                          <a
                            key={contestIndex}
                            href={contest.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`absolute left-px right-px rounded-sm px-px py-px border-l group hover:shadow-md transition-all z-10 bg-gradient-to-r ${getPlatformColor(contest.platform)} bg-opacity-90`}
                            style={{
                              top: `${position * 20}px`, // 20px = h-5
                              height: `${height}px`,
                            }}
                          >
                            <div className="flex flex-col h-full overflow-hidden">
                              <div className="text-[7px] font-bold text-white truncate leading-tight">
                                {formatTime(contest.startTime)}
                                {contest.status === 'ongoing' && ' 🔴'}
                              </div>
                              <div className="text-[7px] font-semibold text-white truncate leading-tight">
                                {contest.name}
                              </div>
                              {height > 30 && (
                                <div className="text-[6px] text-white/70 truncate leading-tight">
                                  {formatPlatformName(contest.platform)}
                                </div>
                              )}
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-1 bg-black/40 border-t border-red-800/30 text-center text-[9px] text-gray-500">
              Scroll to view all days
            </div>
          </div>
        )}

        {/* Info Footer */}
        <div className="mt-12 p-6 bg-gradient-to-r from-gray-900/50 to-gray-800/50 border border-gray-700 rounded-xl text-center">
          <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
            Never miss a contest!
          </h3>
          <p className="text-gray-400 mb-4 text-sm sm:text-base">
            Sign up to get contest reminders and track your competitive programming journey
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

export default Contests;
