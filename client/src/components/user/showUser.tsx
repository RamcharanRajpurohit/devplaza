import React, { useState } from 'react';
import { 
  User, 
  Trophy, 
  Target, 
  Code, 
  GitBranch, 
  Star, 
  Calendar,
  TrendingUp,
  Award,
  Brain,
  Zap,
  ChevronRight,
  Eye,
  Globe,
  MapPin,
  BookOpen,
  Timer,
  Activity,
  Shield,
  BarChart3,
  Medal,
  CheckCircle,
  AlertCircle,
  FireExtinguisher,
  Users,
  ExternalLink
} from 'lucide-react';

 const data = {
  github: {
    platform: "GitHub",
    name: "Ramcharan Rajpurohit",
    bio: "IIT Jodhpur Civil Engineering student who builds both bridges AND web apps! 🌉💻 MERN stack enthusiast + DSA problem solver = full-stack civil engineer! 🚀",
    followers: 12,
    repos: 9,
    avatar: "https://avatars.githubusercontent.com/u/141803837?v=4"
  },
  leetcode: {
    platform: "LeetCode",
    name: "Ramcharan",
    about: "",
    country: "India",
    avatar: "https://assets.leetcode.com/users/default_avatar.jpg",
    rank: 866842,
    reputation: 0,
    easySolved: 53,
    mediumSolved: 76,
    hardSolved: 21,
    totalSolved: 150,
    contest: {
      attended: 3,
      rating: 1419.191,
      globalRanking: 543052,
      topPercentage: 75.23
    }
  },
  codeforces: {
    platform: "Codeforces",
    name: "",
    handle: "Ramcharanrajpurohit",
    rating: 1033,
    maxRating: 1033,
    rank: "newbie",
    avatar: "https://userpic.codeforces.org/no-title.jpg",
    solvedCount: 19
  },
  gfg: {
    userInfo: {
      name: "Ramcharan",
      profile_image_url: "https://media.geeksforgeeks.org/img-practice/user_web-1598433228.svg",
      institute_name: "Indian Institute of Technology (IIT) Jodhpur",
      score: 279,
      monthly_score: 38,
      total_problems_solved: 68,
      institute_rank: 350,
      pod_solved_longest_streak: 8
    },
    submissions: {
      Easy: {
        "700174": { slug: "left-view-of-binary-tree", pname: "Left View of Binary Tree", lang: "cpp" }
      },
      Medium: {
        "700150": { slug: "merge-sort", pname: "Merge Sort", lang: "cpp" }
      },
      Hard: {
        "700494": { slug: "alien-dictionary", pname: "Alien Dictionary", lang: "cpp" }
      }
    }
  },
  codechef: {
    platform: "CodeChef",
    name: "b23ci1032",
    handle: "b23ci1032",
    rating: "1413",
    maxRating: "1413",
    stars: "★★",
    contestsParticipated: 2,
    problemsSolved: "168"
  },
  code360: {
    data: {
      name: "Ramcharan",
      image: "https://p.naukimg.com/jphotoV1/s244:LukcMTq82wcdH7m3VwgEbp02y3Upa8w6zyaSJdzVyIJSAVwlsXxS8cTb",
      college: "Indian Institute of Technology, Jodhpur",
      graduation_year: 2027,
      about: "I'm a 3rd-year B.Tech student at IIT Jodhpur with a strong foundation in Full Stack Web Development, Data Structures, and Software Engineering. Skilled in the MERN stack (MongoDB, Express, React, Node), I specialize in building scalable, performant, and user-centric web applications.",
      user_level_name: "Champion",
      user_exp: 4038,
      dsa_domain_data: {
        problem_count_data: {
          difficulty_data: [
            { level: "Easy", count: 11 },
            { level: "Moderate", count: 7 },
            { level: "Hard", count: 3 }
          ],
          total_count: 21
        }
      }
    }
  }
};

const CodingProfileDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const profileData = {
    github: {
      platform: "GitHub",
      name: "Ramcharan Rajpurohit",
      bio: " IIT Jodhpur Civil Engineering student who builds both bridges AND web apps! 🌉💻 MERN stack enthusiast + DSA problem solver = full-stack civil engineer! 🚀",
      followers: 0,
      repos: 9,
      avatar: "https://avatars.githubusercontent.com/u/141803837?v=4"
    },
    leetcode: {
      platform: "LeetCode",
      name: "Ramcharan",
      rank: 13599,
      easySolved: 69,
      mediumSolved: 140,
      hardSolved: 29,
      totalSolved: 238,
      contestRating: 1419,
      maxRating: 1493,
      contestsAttended: 3
    },
    codeforces: {
      platform: "Codeforces",
      handle: "Ramcharanrajpurohit",
      rating: 1033,
      rank: "newbie",
      solvedCount: 19
    },
    gfg: {
      name: "Ramcharan",
      institute: "Indian Institute of Technology (IIT) Jodhpur",
      score: 279,
      totalSolved: 68,
      instituteRank: 350,
      longestStreak: 8
    },
    codechef: {
      platform: "CodeChef",
      name: "b23ci1032",
      rating: "1413",
      stars: "★★",
      problemsSolved: "61"
    },
    codalio: {
      totalQuestions: 319,
      totalActiveDays: 72,
      totalContests: 18,
      currentStreak: 0,
      maxStreak: 42,
      verified: false
    }
  };

  // Generate mock activity data for heatmap
  const generateActivityData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
 
    
    months.forEach((month, monthIndex) => {
      const daysInMonth = monthIndex === 1 ? 28 : (monthIndex % 2 === 0 ? 31 : 30);
      const monthData = [];
      
      for (let day = 0; day < daysInMonth; day++) {
        const intensity = Math.random();
        let level = 0;
        if (intensity > 0.8) level = 4;
        else if (intensity > 0.6) level = 3;
        else if (intensity > 0.4) level = 2;
        else if (intensity > 0.2) level = 1;
        
        monthData.push(level);
      }
      data.push({ month, days: monthData });
    });
    
    return data;
  };

  const activityData = generateActivityData();

  const PlatformCard = ({ platform, data, color, icon: Icon, external = false }) => (
    <div className={`bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-${color}-500 transition-all duration-300 hover:shadow-lg hover:shadow-${color}-500/20 group`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 bg-${color}-500/20 rounded-lg group-hover:bg-${color}-500/30 transition-colors`}>
            <Icon className={`w-5 h-5 text-${color}-400`} />
          </div>
          <h3 className="text-lg font-semibold text-white">{platform}</h3>
        </div>
        {external ? <ExternalLink className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
      </div>
      {data}
    </div>
  );

  const StatCard = ({ title, value, subtitle, color = "blue", icon: Icon, trend }) => (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <Icon className={`w-5 h-5 text-${color}-400`} />
        <span className={`text-${color}-400 text-sm font-medium`}>{title}</span>
      </div>
      <div className="text-2xl font-bold text-white mb-1 flex items-center space-x-2">
        <span>{value}</span>
        {trend && (
          <TrendingUp className={`w-4 h-4 ${trend > 0 ? 'text-green-400' : 'text-red-400'}`} />
        )}
      </div>
      {subtitle && <div className="text-gray-400 text-sm">{subtitle}</div>}
    </div>
  );

  const CircularProgress = ({ value, max, color, size = 120, showProgress = true }) => {
    const percentage = (value / max) * 100;
    const strokeDasharray = `${percentage * 2.51} 251`;
    
    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size/2}
            cy={size/2}
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-gray-700"
          />
          <circle
            cx={size/2}
            cy={size/2}
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={strokeDasharray}
            className={`text-${color}-400 transition-all duration-700`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-white">{value}</span>
        </div>
        {showProgress && (
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
            <span className="text-xs text-gray-400">{Math.round(percentage)}%</span>
          </div>
        )}
      </div>
    );
  };

  const ActivityHeatmap = ({ data }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-300">Activity Heatmap</h4>
        <div className="flex items-center space-x-2 text-xs text-gray-400">
          <span>Less</span>
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-gray-700 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-800 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-600 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-300 rounded-sm"></div>
          </div>
          <span>More</span>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <div className="flex space-x-2 min-w-max">
          {data.map((monthData, monthIndex) => (
            <div key={monthIndex} className="space-y-1">
              <div className="text-xs text-gray-400 text-center mb-2 min-w-16">
                {monthData.month}
              </div>
              <div className="grid grid-rows-7 gap-1">
                {Array.from({ length: 35 }, (_, dayIndex) => {
                  const day = monthData.days[dayIndex] || 0;
                  const intensity = day === 0 ? 'bg-gray-700' : 
                                  day === 1 ? 'bg-green-800' :
                                  day === 2 ? 'bg-green-600' :
                                  day === 3 ? 'bg-green-400' : 'bg-green-300';
                  
                  return (
                    <div
                      key={dayIndex}
                      className={`w-3 h-3 ${intensity} rounded-sm hover:ring-1 hover:ring-white/50 transition-all cursor-pointer`}
                      title={`${day} contributions`}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const RatingChart = () => (
    <div className="bg-gray-700/30 rounded-lg p-4">
      <h4 className="text-sm font-medium text-gray-300 mb-3">Rating Progress</h4>
      <div className="relative h-32">
        <svg className="w-full h-full" viewBox="0 0 400 120">
          <defs>
            <linearGradient id="ratingGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0"/>
            </linearGradient>
          </defs>
          <path
            d="M 0 100 Q 100 20 200 60 T 400 80 L 400 120 L 0 120 Z"
            fill="url(#ratingGradient)"
          />
          <path
            d="M 0 100 Q 100 20 200 60 T 400 80"
            stroke="#f59e0b"
            strokeWidth="2"
            fill="none"
          />
        </svg>
        <div className="absolute top-2 right-2 text-xs text-gray-400">
          Peak: {profileData.leetcode.maxRating}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header with Profile */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Profile Section */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 space-y-6">
              {/* Profile Picture and Basic Info */}
              <div className="text-center space-y-4">
                <div className="relative inline-block">
                  <img 
                    src={profileData.github.avatar} 
                    alt="Profile" 
                    className="w-20 h-20 rounded-full border-4 border-green-500 shadow-lg"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-full border-2 border-gray-800"></div>
                </div>
                
                <div>
                  <h2 className="text-xl font-bold text-white">{profileData.github.name.split(' ')[0]}</h2>
                  <p className="text-green-400 text-sm">@{profileData.github.name.replace(' ', '').toLowerCase()}</p>
                </div>

                {/* Verification Status */}
                <div className="flex items-center justify-center space-x-2 p-2 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-orange-400" />
                  <span className="text-xs text-orange-300">Not Verified</span>
                </div>
              </div>

              {/* Platform Links */}
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Code className="w-4 h-4 text-orange-400" />
                    <span className="text-sm text-gray-300">LeetCode</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </div>
                
                <div className="flex items-center justify-between p-2 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Brain className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-gray-300">GeeksforGeeks</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </div>
                
                <div className="flex items-center justify-between p-2 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-gray-300">CodeChef</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </div>
                
                <div className="flex items-center justify-between p-2 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-gray-300">Codeforces</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Location and Education */}
              <div className="space-y-2 pt-4 border-t border-gray-700">
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <MapPin className="w-4 h-4" />
                  <span>India</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <BookOpen className="w-4 h-4" />
                  <span>IIT Jodhpur</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Dashboard */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard 
                title="Total Questions" 
                value={profileData.codalio.totalQuestions} 
                subtitle="Across all platforms"
                color="blue"
                icon={Target}
              />
              <StatCard 
                title="Active Days" 
                value={profileData.codalio.totalActiveDays} 
                subtitle="Coding consistency"
                color="green"
                icon={Calendar}
              />
              <StatCard 
                title="Total Contests" 
                value={profileData.codalio.totalContests} 
                subtitle="Competition experience"
                color="purple"
                icon={Trophy}
              />
            </div>

            {/* Activity Heatmap */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Coding Activity</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Fire className="w-4 h-4 text-orange-400" />
                    <span>Max Streak: {profileData.codalio.maxStreak}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Activity className="w-4 h-4 text-green-400" />
                    <span>Current: {profileData.codalio.currentStreak}</span>
                  </div>
                </div>
              </div>
              <ActivityHeatmap data={activityData} />
            </div>

            {/* Platform Performance & Rating Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* LeetCode Detailed */}
              <PlatformCard 
                platform="LeetCode Performance" 
                color="orange"
                icon={Code}
                external={true}
                data={
                  <div className="space-y-4">
                    <RatingChart />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <CircularProgress value={238} max={300} color="orange" size={80} />
                        <div>
                          <div className="text-2xl font-bold text-white">{profileData.leetcode.totalSolved}</div>
                          <div className="text-gray-400 text-sm">Problems Solved</div>
                          <div className="text-xs text-gray-500">Rank: #{profileData.leetcode.rank.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-green-400 text-lg font-bold">{profileData.leetcode.easySolved}</div>
                        <div className="text-gray-400 text-xs">Easy</div>
                      </div>
                      <div className="text-center">
                        <div className="text-yellow-400 text-lg font-bold">{profileData.leetcode.mediumSolved}</div>
                        <div className="text-gray-400 text-xs">Medium</div>
                      </div>
                      <div className="text-center">
                        <div className="text-red-400 text-lg font-bold">{profileData.leetcode.hardSolved}</div>
                        <div className="text-gray-400 text-xs">Hard</div>
                      </div>
                    </div>
                  </div>
                }
              />

              {/* Awards and Achievements */}
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <Award className="w-5 h-5 text-yellow-400" />
                  <span>Awards & Achievements</span>
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <Medal className="w-8 h-8 text-white" />
                    </div>
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center">
                      <Trophy className="w-8 h-8 text-white" />
                    </div>
                    <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center">
                      <Star className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white mb-2">3</div>
                    <div className="text-gray-400 text-sm">Total Awards</div>
                  </div>

                  {/* Contest Rankings */}
                  <div className="space-y-3 pt-4 border-t border-gray-700">
                    <h4 className="text-sm font-medium text-gray-300">Contest Rankings</h4>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Code className="w-4 h-4 text-orange-400" />
                        <span className="text-sm text-gray-300">LeetCode</span>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold">{profileData.leetcode.contestRating}</div>
                        <div className="text-xs text-gray-400">max: {profileData.leetcode.maxRating}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm text-gray-300">CodeChef</span>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold">{profileData.codechef.rating}</div>
                        <div className="text-xs text-gray-400">{profileData.codechef.stars}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Zap className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-gray-300">Codeforces</span>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold">{profileData.codeforces.rating}</div>
                        <div className="text-xs text-gray-400 capitalize">{profileData.codeforces.rank}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* DSA Topics Analysis */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                <span>DSA Topic Analysis</span>
              </h3>
              
              <div className="space-y-3">
                {[
                  { name: 'Arrays', count: 80, color: 'blue' },
                  { name: 'Dynamic Programming', count: 61, color: 'purple' },
                  { name: 'Algorithms', count: 45, color: 'green' },
                  { name: 'String', count: 43, color: 'yellow' },
                  { name: 'DFS', count: 31, color: 'red' },
                  { name: 'BFS', count: 27, color: 'pink' },
                  { name: 'HashMap and Set', count: 25, color: 'indigo' },
                  { name: 'Sorting', count: 22, color: 'orange' },
                  { name: 'Graphs', count: 21, color: 'teal' },
                  { name: 'Trees', count: 19, color: 'cyan' }
                ].map((topic, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">{topic.name}</span>
                      <span className="text-white font-medium">{topic.count}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`bg-blue-400 h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${(topic.count / 80) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          <p>Last updated: 29 Jul 2025 • Keep coding, keep growing! 🚀</p>
        </div>
      </div>
    </div>
  );
};

export default CodingProfileDashboard;