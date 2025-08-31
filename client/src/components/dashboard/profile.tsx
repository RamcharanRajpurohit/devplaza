import React, { useState } from 'react';
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
  RefreshCw
} from 'lucide-react';

interface PlatformStats {
  name: string;
  rank: number;
  maxRank: number;
  problems?: number;
}

interface ContestData {
  name: string;
  count: number;
}

const CodingProfileDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const platformStats: PlatformStats[] = [
    { name: 'LeetCode', rank: 1419, maxRank: 1493 },
    { name: 'CodeChef', rank: 1426, maxRank: 1426 },
    { name: 'CodeForces', rank: 1033, maxRank: 1033 }
  ];

  const contestData: ContestData[] = [
    { name: 'LeetCode', count: 3 },
    { name: 'CodeChef', count: 4 },
    { name: 'CodeForces', count: 11 }
  ];

  const dsaTopics = [
    { name: 'Dynamic Programming', solved: 54, total: 92 },
    { name: 'Algorithms', solved: 49, total: 70 },
    { name: 'String', solved: 37, total: 60 },
    { name: 'DFS', solved: 31, total: 45 },
    { name: 'HashMap and Set', solved: 29, total: 40 },
    { name: 'BFS', solved: 27, total: 35 },
    { name: 'Sorting', solved: 25, total: 35 },
    { name: 'Graphs', solved: 24, total: 40 },
    { name: 'Trees', solved: 19, total: 30 }
  ];

  const getProgressPercentage = (solved: number, total: number) => {
    return (solved / total) * 100;
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 70) return 'bg-gradient-to-r from-red-800 to-red-600';
    if (percentage >= 50) return 'bg-gradient-to-r from-red-900 to-red-700';
    if (percentage >= 30) return 'bg-gradient-to-r from-red-950 to-red-800';
    return 'bg-gradient-to-r from-gray-800 to-gray-700';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-red-800 to-red-600 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg shadow-red-900/50">
              R
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-red-200 bg-clip-text text-transparent">Ramcharan</h1>
              <p className="text-gray-400">@ramcharankapurohit</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-red-800 to-red-700 px-4 py-2 rounded-lg flex items-center space-x-2 hover:from-red-700 hover:to-red-600 transition-all duration-300 shadow-lg shadow-red-900/30">
              <Award className="w-4 h-4" />
              <span className="text-red-100">Get your Codallo Card</span>
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="grid grid-cols-12 gap-6 mb-8">
          {/* Left Sidebar */}
          <div className="col-span-3 space-y-6">
            <div className="bg-gradient-to-br from-gray-900 via-red-950 to-black rounded-lg p-6 border border-red-900/30 shadow-xl shadow-black/50">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-3 h-3 bg-gradient-to-r from-red-600 to-red-500 rounded-full shadow-sm shadow-red-600/50"></div>
                <span className="text-sm text-gray-300">Public Profile</span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-gray-200">
                  <MapPin className="w-4 h-4 text-red-400" />
                  <span>India</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-200">
                  <Building className="w-4 h-4 text-red-400" />
                  <span>Indian Institute of Technology</span>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold mb-3 bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">Problem Solving Stats</h3>
                <div className="space-y-2">
                  {['LeetCode', 'CodeStudio', 'GeeksForGeeks', 'CodeChef', 'CodeForces'].map((platform, index) => (
                    <div key={platform} className="flex items-center justify-between py-2 hover:bg-gradient-to-r hover:from-red-950/50 hover:to-gray-900/50 rounded px-2 transition-all duration-200">
                      <span className="text-sm text-gray-200">{platform}</span>
                      <ChevronRight className="w-4 h-4 text-red-400" />
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 bg-gradient-to-r from-red-800 to-red-700 hover:from-red-700 hover:to-red-600 py-2 rounded-lg text-sm font-medium transition-all duration-300 shadow-lg shadow-red-900/30 text-red-100">
                  Add Platform
                </button>
              </div>

              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-300">Profile Views:</span>
                  <span className="text-sm text-red-400 font-semibold">11</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-300">Last Refresh:</span>
                  <span className="text-sm text-gray-200">30 Aug 2025</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-300">Profile Visibility:</span>
                  <span className="text-sm text-red-400 font-semibold">Public</span>
                </div>
                <button className="w-full bg-gradient-to-r from-red-900 to-red-800 hover:from-red-800 hover:to-red-700 py-2 rounded-lg text-sm font-medium transition-all duration-300 shadow-lg shadow-red-900/40 text-red-100">
                  View Leaderboard
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-9 space-y-6">
            {/* Top Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-gray-900 via-red-950 to-black border border-red-900/30 rounded-lg p-6 shadow-xl shadow-black/30">
                <h3 className="text-gray-300 text-sm mb-2">Total Questions</h3>
                <p className="text-3xl font-bold bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">359</p>
              </div>
              <div className="bg-gradient-to-br from-gray-900 via-red-950 to-black border border-red-900/30 rounded-lg p-6 shadow-xl shadow-black/30">
                <h3 className="text-gray-300 text-sm mb-2">Total Active Days</h3>
                <p className="text-3xl font-bold bg-gradient-to-r from-red-500 to-red-400 bg-clip-text text-transparent">84</p>
              </div>
              <div className="bg-gradient-to-br from-gray-900 via-red-950 to-black border border-red-900/30 rounded-lg p-6 shadow-xl shadow-black/30">
                <h3 className="text-gray-300 text-sm mb-2">Total Contests</h3>
                <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">18</p>
              </div>
              <div className="bg-gradient-to-br from-gray-900 via-red-950 to-black border border-red-900/30 rounded-lg p-6 shadow-xl shadow-black/30">
                <div className="grid grid-cols-8 gap-1 mb-4">
                  {Array.from({length: 56}, (_, i) => (
                    <div 
                      key={i}
                      className={`w-3 h-3 rounded-sm ${
                        Math.random() > 0.7 ? 'bg-red-500 shadow-sm shadow-red-500/50' : 
                        Math.random() > 0.5 ? 'bg-red-600' : 
                        Math.random() > 0.3 ? 'bg-red-700' : 'bg-gray-800'
                      }`}
                    ></div>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>May</span>
                  <span>Aug</span>
                </div>
              </div>
            </div>

            {/* Contest Data and Rating Chart */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-gray-900 via-red-950 to-black border border-red-900/30 rounded-lg p-6 shadow-xl shadow-black/30">
                <h3 className="font-semibold mb-4 bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">Contest Data</h3>
                <div className="space-y-3">
                  {contestData.map((contest, index) => (
                    <div key={contest.name} className="flex justify-between items-center py-2 border-b border-red-900/20">
                      <span className="text-sm text-gray-200">{contest.name}</span>
                      <span className="font-semibold text-red-400">{contest.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-900 via-red-950 to-black border border-red-900/30 rounded-lg p-6 shadow-xl shadow-black/30">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">Rating</h3>
                    <p className="text-2xl font-bold text-red-400">1419</p>
                    <p className="text-xs text-gray-400">15 Jun 2025</p>
                    <p className="text-xs text-gray-400">Weekly Contest 454</p>
                    <p className="text-xs text-gray-400">Rank 13569</p>
                  </div>
                </div>
                <div className="h-32 bg-gradient-to-r from-red-900 via-red-800 to-red-700 rounded relative overflow-hidden shadow-inner">
                  <svg className="w-full h-full" viewBox="0 0 300 100">
                    <path 
                      d="M 0,20 Q 75,15 150,25 T 300,80" 
                      stroke="currentColor" 
                      strokeWidth="3" 
                      fill="none"
                      className="text-red-200 drop-shadow-sm"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Problems Solved and Rankings */}
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-gray-900 via-red-950 to-black border border-red-900/30 rounded-lg p-6 shadow-xl shadow-black/30">
                <h3 className="font-semibold mb-4 bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">Problems Solved</h3>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="relative w-20 h-20 mx-auto mb-2">
                      <svg className="w-20 h-20 transform -rotate-90">
                        <circle cx="40" cy="40" r="30" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-gray-800"/>
                        <circle cx="40" cy="40" r="30" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray={`${2 * Math.PI * 30}`} strokeDashoffset={`${2 * Math.PI * 30 * (1 - 0.1)}`} className="text-red-500"/>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-bold text-red-400">1</span>
                      </div>
                    </div>
                    <p className="text-sm text-red-400">CFG</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-2 text-red-300">DSA</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-red-400">Easy</span>
                        <span className="text-xs text-gray-200">86</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-red-500">Medium</span>
                        <span className="text-xs text-gray-200">161</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-red-600">Hard</span>
                        <span className="text-xs text-gray-200">31</span>
                      </div>
                    </div>
                    <div className="text-center mt-4">
                      <div className="text-2xl font-bold bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">278</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-900 via-red-950 to-black border border-red-900/30 rounded-lg p-6 shadow-xl shadow-black/30">
                <h3 className="font-semibold mb-4 bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">Competitive Programming</h3>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="relative w-20 h-20 mx-auto mb-2">
                      <svg className="w-20 h-20 transform -rotate-90">
                        <circle cx="40" cy="40" r="30" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-gray-800"/>
                        <circle cx="40" cy="40" r="30" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray={`${2 * Math.PI * 30}`} strokeDashoffset={`${2 * Math.PI * 30 * (1 - 0.8)}`} className="text-red-500"/>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-bold text-red-400">80</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-red-400">Codechef: 61</p>
                      <p className="text-sm text-red-500">Codeforces: 19</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-900 via-red-950 to-black border border-red-900/30 rounded-lg p-6 shadow-xl shadow-black/30">
                <h3 className="font-semibold mb-4 bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">Contest Rankings</h3>
                <div className="space-y-4">
                  {platformStats.map((platform, index) => (
                    <div key={platform.name} className="text-center">
                      <h4 className="text-sm font-semibold mb-1 text-gray-200">{platform.name.toUpperCase()}</h4>
                      <div className="text-2xl font-bold bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">{platform.rank}</div>
                      <div className="text-xs text-gray-400">(max: {platform.maxRank})</div>
                      {platform.name === 'CodeForces' && (
                        <div className="text-sm text-red-400 mt-1">Newbie</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Awards */}
            <div className="bg-gradient-to-br from-gray-900 via-red-950 to-black border border-red-900/30 rounded-lg p-6 shadow-xl shadow-black/30">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">Awards</h3>
                <span className="text-sm text-gray-400">4</span>
              </div>
              <div className="flex space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-700 to-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-900/50">
                  <Trophy className="w-6 h-6 text-red-200" />
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-red-800 to-red-700 rounded-full flex items-center justify-center shadow-lg shadow-red-900/50">
                  <Star className="w-6 h-6 text-red-200" />
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-red-900 to-red-800 rounded-full flex items-center justify-center shadow-lg shadow-red-900/50">
                  <Star className="w-6 h-6 text-red-200" />
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-700 rounded-full flex items-center justify-center shadow-lg shadow-black/50">
                  <Award className="w-6 h-6 text-gray-200" />
                </div>
              </div>
            </div>

            {/* DSA Topic Analysis */}
            <div className="bg-gradient-to-br from-gray-900 via-red-950 to-black border border-red-900/30 rounded-lg p-6 shadow-xl shadow-black/30">
              <h3 className="font-semibold mb-4 bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">DSA Topic Analysis</h3>
              <div className="space-y-3">
                {dsaTopics.map((topic, index) => {
                  const percentage = getProgressPercentage(topic.solved, topic.total);
                  return (
                    <div key={topic.name} className="flex items-center space-x-4">
                      <div className="w-32 text-sm text-gray-200">{topic.name}</div>
                      <div className="flex-1 bg-gradient-to-r from-gray-800 to-black rounded-full h-6 relative overflow-hidden shadow-inner">
                        <div 
                          className={`h-6 rounded-full ${getProgressColor(percentage)} flex items-center justify-center text-xs font-medium text-white shadow-sm`}
                          style={{ width: `${Math.max(percentage, 15)}%` }}
                        >
                          {topic.solved}
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 w-12 text-right">
                        {topic.total}
                      </div>
                    </div>
                  );
                })}
              </div>
              <button className="mt-4 text-sm text-red-400 hover:text-red-300 transition-colors duration-200">
                show more
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-br from-gray-900 via-red-950 to-black border border-red-900/30 rounded-lg p-6 mt-8 shadow-xl shadow-black/30">
          <div className="flex justify-center space-x-8 text-sm text-gray-300">
            <span className="hover:text-red-400 cursor-pointer transition-colors duration-200">FAQ</span>
            <span className="hover:text-red-400 cursor-pointer transition-colors duration-200">Support</span>
            <span className="hover:text-red-400 cursor-pointer transition-colors duration-200">Contact Us</span>
            <span className="hover:text-red-400 cursor-pointer transition-colors duration-200">Privacy</span>
            <span className="hover:text-red-400 cursor-pointer transition-colors duration-200">Timeline</span>
            <span className="hover:text-red-400 cursor-pointer transition-colors duration-200">Terms</span>
            <span className="hover:text-red-400 cursor-pointer transition-colors duration-200">Refund Policy</span>
          </div>
          <div className="flex justify-center space-x-4 mt-4">
            <Link className="w-5 h-5 text-gray-400 hover:text-red-400 cursor-pointer transition-colors duration-200" />
            <span className="w-5 h-5 text-gray-400 hover:text-red-400 cursor-pointer transition-colors duration-200">𝕏</span>
            <div className="w-5 h-5 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-red-600 hover:to-red-500 rounded cursor-pointer transition-all duration-200"></div>
          </div>
          <div className="text-center text-xs text-gray-500 mt-4">
            © 2025 Codallo, Inc. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodingProfileDashboard;