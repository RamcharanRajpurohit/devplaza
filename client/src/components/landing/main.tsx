import { useEffect, useState } from 'react';
import { Users, Trophy, Star, Code, Calendar, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PublicHeader from '../common/PublicHeader';
import { potdService, contestService } from '../../services/api';

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

const DevPlazaLanding = () => {
  const { isAuthenticated } = useAuth();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [contests, setContests] = useState<Contest[]>([]);
  const [loadingPOTD, setLoadingPOTD] = useState(true);
  const [loadingContests, setLoadingContests] = useState(true);

  useEffect(() => {
    if (isAuthenticated) window.location.href = '/dashboard';
  }, [isAuthenticated]);

  useEffect(() => {
    fetchPOTDs();
    fetchContests();
  }, []);

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

  // Features data
  const features = [
    { Icon: Star, text: 'Free to use' },
    { Icon: Users, text: 'Live updates' },
    { Icon: Trophy, text: 'All platforms' }
  ];

  // Steps data
  const steps = [
    { num: 1, title: 'Sign Up', desc: 'Create your free DevPlaza account in seconds.' },
    { num: 2, title: 'Fill Info', desc: 'Add your usernames for LeetCode, Codeforces, GeeksforGeeks, and GitHub.' },
    { num: 3, title: 'Get Profile', desc: 'Share your professional developer profile with live stats and achievements.' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950">
      {/* Navbar */}
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                    Showcase Your
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">
                    CP Journey
                  </span>
                </h1>
                <p className="text-lg sm:text-xl text-gray-300 max-w-lg">
                  Create stunning developer profiles by aggregating your coding stats from LeetCode, Codeforces, GeeksforGeeks, and GitHub all in one place.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auth/signup" className="px-8 py-4 bg-gradient-to-r from-red-800 to-red-700 hover:from-red-700 hover:to-red-600 rounded-lg text-white font-medium transition-all duration-300 shadow-lg shadow-red-900/30 transform hover:scale-105">
                  Get Started Free
                </Link>
                <Link to="/profile/ram" className="px-8 py-4 border border-red-600/50 text-red-400 hover:bg-red-900/30 rounded-lg transition-all duration-200 font-medium">
                  View Demo Profile
                </Link>
              </div>

              <div className="flex items-center space-x-6 text-sm text-gray-400">
                {features.map(({ Icon, text }, i) => (
                  <div key={i} className="flex items-center space-x-1">
                    <Icon className="w-4 h-4 text-yellow-400 fill-current" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Content - Image Preview */}
            <div className="relative">
              <div className="relative h-96 bg-gradient-to-br from-gray-900 via-red-950 to-black border border-red-900/30 rounded-xl shadow-2xl overflow-hidden">
                <img src="/demo.png" alt="DevPlaza Preview" className="object-contain w-full h-full" />
                <div className="w-full h-full bg-cover bg-center bg-no-repeat" style={{
                  backgroundImage: `radial-gradient(circle at 20% 80%, rgba(220, 38, 38, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(239, 68, 68, 0.2) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(185, 28, 28, 0.1) 0%, transparent 50%)`
                }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-red-950/30"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    

      {/* Problem of the Day Section */}
      <section className="py-20 bg-black/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent flex items-center gap-3">
                <Code className="w-8 h-8 text-red-400" />
                Today's Problems
              </h2>
              <p className="text-gray-400 mt-2">Daily coding challenges from top platforms</p>
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
            <div className="text-center py-12 text-gray-500">
              <Code className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No problems available today</p>
            </div>
          ) : (
            <div className="relative">
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
            </div>
          )}
        </div>
      </section>

      {/* Contests Section */}
      <section className="py-20 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent flex items-center gap-3">
                <Trophy className="w-8 h-8 text-red-400" />
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
            <div className="text-center py-12 text-gray-500">
              <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No contests scheduled today</p>
            </div>
          ) : (
            <div className="relative">
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
            </div>
          )}
        </div>
      </section>
        {/* Process Section */}
      <section className="py-20 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              How It Works
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Get your professional developer profile ready in just three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map(({ num, title, desc }) => (
              <div key={num} className="relative bg-gradient-to-br from-gray-900 via-red-950 to-black border border-red-900/30 rounded-xl p-8 text-center group hover:scale-105 transition-transform duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-800 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-2xl font-bold text-white">{num}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
                  <p className="text-gray-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-black border-t border-red-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">
              DevPlaza
            </h3>
            <p className="text-gray-400 max-w-2xl mx-auto">
              DevPlaza is the ultimate platform for competitive programmers to showcase their coding journey. 
              Aggregate your profiles from multiple platforms, display live statistics, and benefit from our 
              intelligent caching system for fast, up-to-date information.
            </p>
            <div className="pt-6 border-t border-gray-800">
              <p className="text-gray-500 text-sm">
                © {new Date().getFullYear()} DevPlaza. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DevPlazaLanding;