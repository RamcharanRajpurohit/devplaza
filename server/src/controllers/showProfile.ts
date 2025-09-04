import { fetchGithubProfile } from "../services/github";
import { fetchLeetcodeProfile } from "../services/leetcode";
import { fetchCodeforcesProfile } from "../services/codeforces";
import { fetchGFGUserData } from "../services/gfg";
import { Request, Response } from "express";
import { fetchCodechefProfile } from "../services/codechef";
import { fetchCode360Profile } from "../services/code360";
import { User } from "../models/user";
import { UserInfo } from "../models/userInfo";

interface ProfileParams {
  username: string;
}

// Helper function to generate activity calendar data (you'll need to implement actual date tracking)
const generateActivityCalendar = (submissions: any) => {
  // This is a placeholder - you'll need to implement actual date tracking
  const calendar = [];
  const currentDate = new Date();
  
  for (let i = 365; i >= 0; i--) {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - i);
    
    calendar.push({
      date: date.toISOString().split('T')[0],
      count: Math.floor(Math.random() * 6), // Random for now - replace with actual data
      level: Math.floor(Math.random() * 5)
    });
  }
  
  return calendar;
};

// Helper function to extract topic analysis from GFG submissions
const extractTopicAnalysis = (submissions: any) => {
  const topics: { [key: string]: number } = {};
  
  // This is based on common problem patterns - you might want to enhance this
  const topicKeywords = {
    'array': ['array', 'subarray', 'kadane'],
    'dynamicProgramming': ['dp', 'knapsack', 'fibonacci', 'climb', 'coin'],
    'tree': ['tree', 'binary', 'bst', 'traversal'],
    'graph': ['graph', 'dfs', 'bfs', 'shortest', 'path'],
    'string': ['string', 'palindrome', 'substring'],
    'sorting': ['sort', 'merge', 'quick'],
    'searching': ['search', 'binary'],
    'linkedList': ['linked', 'list', 'node'],
    'stack': ['stack', 'bracket', 'parentheses'],
    'queue': ['queue', 'circular']
  };

  Object.entries(submissions).forEach(([difficulty, problems]: [string, any]) => {
    Object.values(problems).forEach((problem: any) => {
      const problemName = problem.pname?.toLowerCase() || '';
      
      Object.entries(topicKeywords).forEach(([topic, keywords]) => {
        if (keywords.some(keyword => problemName.includes(keyword))) {
          topics[topic] = (topics[topic] || 0) + 1;
        }
      });
    });
  });

  return topics;
};

// Helper function to generate awards based on achievements
const generateAwards = (data: any) => {
  const awards = [];
  
  // Calculate total problems solved across all platforms with null checks
  const totalSolved = 
    (data.leetcode?.totalSolved || 0) +
    (data.gfg?.userInfo?.total_problems_solved || 0) +
    (data.codeforces?.solvedCount || 0) +
    (data.codechef?.problemsSolved ? parseInt(data.codechef.problemsSolved) : 0) +
    (data.code360?.data?.dsa_domain_data?.problem_count_data?.total_count || 0);

  if (totalSolved > 100) {
    awards.push({
      id: 'problem_solver',
      title: 'Problem Solver',
      description: `Solved ${totalSolved}+ problems`,
      icon: '🏆',
      color: 'gold',
      earnedDate: new Date().toISOString()
    });
  }

  if (data.leetcode?.contest?.attended && data.leetcode.contest.attended > 0) {
    awards.push({
      id: 'contest_participant',
      title: 'Contest Warrior',
      description: `Participated in ${data.leetcode.contest.attended} contests`,
      icon: '⚔️',
      color: 'purple',
      earnedDate: new Date().toISOString()
    });
  }

  // Multi-platform award
  const activePlatforms = [
    data.github, data.leetcode, data.codeforces, 
    data.gfg, data.codechef, data.code360
  ].filter(platform => platform && Object.keys(platform).length > 0).length;

  if (activePlatforms >= 4) {
    awards.push({
      id: 'multi_platform',
      title: 'Multi-Platform Coder',
      description: `Active on ${activePlatforms} platforms`,
      icon: '🌟',
      color: 'blue',
      earnedDate: new Date().toISOString()
    });
  }

  return awards;
};

export const showProfile = async (req: Request<ProfileParams>, res: Response) => {
  try {
     const { username } = req.params;
    console.log("📡 Fetching profile for:", username);

    // 🔥 Find base user
    const userData = await User.findOne({ username });
    console.log("✅ User data:", userData);

    // 🔥 Find userInfo by reference
    const userInfoData = await UserInfo.findOne({ user: userData?._id });
    console.log("✅ UserInfo data:", userInfoData);

    if (!userData || !userInfoData) {
      console.warn("⚠️ User not found:", username);
      return res.status(404).json({ error: "User not found" });
    }

    // 🚨 Ensure links exist
    if (
      !userInfoData?.links?.code360 ||
      !userInfoData?.links?.github ||
      !userInfoData?.links?.leetcode ||
      !userInfoData?.links?.codeforces ||
      !userInfoData?.links?.gfg ||
      !userInfoData?.links?.codechef
    ) {
      console.warn("⚠️ Incomplete profile links for:", username);
      return res
        .status(400)
        .json({ error: "Please complete your profile links first." });
    }

    // 🔥 Fetch all profiles in parallel
    const [github, leetcode, codeforces, gfg, codechef, code360] =
      await Promise.all([
        fetchGithubProfile(userInfoData.links.github),
        fetchLeetcodeProfile(userInfoData.links.leetcode),
        fetchCodeforcesProfile(userInfoData.links.codeforces),
        fetchGFGUserData(userInfoData.links.gfg),
        fetchCodechefProfile(userInfoData.links.codechef),
        fetchCode360Profile(userInfoData.links.code360),
      ]);

    console.log(gfg, codechef, code360, github, leetcode, codeforces);

    // Calculate derived metrics with proper null checks
    const totalProblemsAllPlatforms = 
      (leetcode?.totalSolved || 0) +
      (gfg?.userInfo?.total_problems_solved || 0) +
      (codeforces?.solvedCount || 0) +
      (codechef?.problemsSolved ? parseInt(codechef.problemsSolved) : 0) +
      (code360?.data?.dsa_domain_data?.problem_count_data?.total_count || 0);

    const totalContests = 
      (leetcode?.contest?.attended || 0) +
      (codechef?.contestsParticipated || 0);

    // Enhanced structured response
    const enhancedProfile = {
      // Profile Information
      profile: {
        name: code360?.data?.name || github?.name || "Ramcharan Rajpurohit",
        username: "ramcharanrajpurohit",
        bio: github?.bio || code360?.data?.about || "",
        avatar: github?.avatar || code360?.data?.image || "",
        location: leetcode?.country || "India",
        institute: code360?.data?.college || "Indian Institute of Technology, Jodhpur",
        graduationYear: code360?.data?.graduation_year || 2027,
        isVerified: false,
        isPublic: true,
        profileViews: code360?.data?.profile_view_count || 0,
        followers: github?.followers || 0,
        following: code360?.data?.following_count || 0,
        lastRefresh: new Date().toISOString().split('T')[0],
        joinedDate: gfg?.userInfo?.created_date || "2025-02-06"
      },

      // Overview Statistics
      overview: {
        totalQuestions: totalProblemsAllPlatforms,
        totalActiveDays: 84, // You'll need to track this from actual activity
        totalContests: totalContests,
        maxStreak: gfg?.userInfo?.pod_solved_longest_streak || 0,
        currentStreak: 0, // You'll need to calculate this from recent activity
        totalSubmissions: totalProblemsAllPlatforms * 1.5, // Approximation
        globalRank: {
          score: gfg?.userInfo?.score || 0,
          position: gfg?.userInfo?.institute_rank || null
        }
      },

      // Activity Calendar (placeholder - you'll need to implement date tracking)
      // activityCalendar: {
      //   year: 2025,
      //   data: generateActivityCalendar(gfg?.submissions)
      // },
       activityCalendar: {
        year: 2025,
        data: []
      },


      // Problems Solved by Category
      problemsSolved: {
        fundamentals: {
          cfg: 1,
          total: 1
        },
        dsa: {
          easy: (leetcode?.easySolved || 0) + (Object.keys(gfg?.submissions?.Easy || {}).length) + (code360?.data?.dsa_domain_data?.problem_count_data?.difficulty_data?.find((d: any) => d.level === 'Easy')?.count || 0),
          medium: (leetcode?.mediumSolved || 0) + (Object.keys(gfg?.submissions?.Medium || {}).length) + (code360?.data?.dsa_domain_data?.problem_count_data?.difficulty_data?.find((d: any) => d.level === 'Moderate')?.count || 0),
          hard: (leetcode?.hardSolved || 0) + (Object.keys(gfg?.submissions?.Hard || {}).length) + (code360?.data?.dsa_domain_data?.problem_count_data?.difficulty_data?.find((d: any) => d.level === 'Hard')?.count || 0),
          total: totalProblemsAllPlatforms
        },
        competitiveProgramming: {
          codechef: codechef?.problemsSolved ? parseInt(codechef.problemsSolved) : 0,
          codeforces: codeforces?.solvedCount || 0,
          total: (codechef?.problemsSolved ? parseInt(codechef.problemsSolved) : 0) + (codeforces?.solvedCount || 0)
        }
      },

      // Platform Details
      platforms: {
        leetcode: {
          name: "LeetCode",
          handle: leetcode?.name || "",
          rank: leetcode?.rank || 0,
          rating: leetcode?.contest?.rating || null,
          maxRating: null,
          totalSolved: leetcode?.totalSolved || 0,
          easySolved: leetcode?.easySolved || 0,
          mediumSolved: leetcode?.mediumSolved || 0,
          hardSolved: leetcode?.hardSolved || 0,
          contestsAttended: leetcode?.contest?.attended || 0,
          contestRating: leetcode?.contest?.rating || 0,
          globalRanking: leetcode?.contest?.globalRanking || 0,
          topPercentage: leetcode?.contest?.topPercentage || 0,
          badges: [],
          recentSubmissions: []
        },
        codeforces: {
          name: "Codeforces",
          handle: codeforces?.handle || "",
          rating: codeforces?.rating || 0,
          maxRating: codeforces?.maxRating || 0,
          rank: codeforces?.rank || "unrated",
          totalSolved: codeforces?.solvedCount || 0,
          contestsAttended: 0,
          badges: [],
          recentSubmissions: []
        },
        codechef: {
          name: "CodeChef",
          handle: codechef?.handle || "",
          rating: codechef?.rating ? parseInt(codechef.rating.replace(/[^\d]/g, '')) : 0,
          maxRating: codechef?.maxRating ? parseInt(codechef.maxRating) : 0,
          stars: codechef?.stars || "",
          totalSolved: codechef?.problemsSolved ? parseInt(codechef.problemsSolved) : 0,
          contestsAttended: codechef?.contestsParticipated || 0,
          badges: [],
          recentSubmissions: []
        },
        geeksforgeeks: {
          name: "GeeksforGeeks",
          handle: gfg?.userInfo?.name || "",
          score: gfg?.userInfo?.score || 0,
          monthlyScore: gfg?.userInfo?.monthly_score || 0,
          totalSolved: gfg?.userInfo?.total_problems_solved || 0,
          instituteRank: gfg?.userInfo?.institute_rank || 0,
          longestStreak: gfg?.userInfo?.pod_solved_longest_streak || 0,
          globalLongestStreak: gfg?.userInfo?.pod_solved_global_longest_streak || 0,
          difficulty: {
            easy: Object.keys(gfg?.submissions?.Easy || {}).length,
            medium: Object.keys(gfg?.submissions?.Medium || {}).length,
            hard: Object.keys(gfg?.submissions?.Hard || {}).length,
            basic: Object.keys(gfg?.submissions?.Basic || {}).length
          },
          badges: [],
          recentSubmissions: []
        },
        code360: {
          name: "Code360 (Coding Ninjas)",
          handle: code360?.data?.name || "",
          totalSolved: code360?.data?.dsa_domain_data?.problem_count_data?.total_count || 0,
          difficulty: {
            easy: code360?.data?.dsa_domain_data?.problem_count_data?.difficulty_data?.find((d: any) => d.level === 'Easy')?.count || 0,
            moderate: code360?.data?.dsa_domain_data?.problem_count_data?.difficulty_data?.find((d: any) => d.level === 'Moderate')?.count || 0,
            hard: code360?.data?.dsa_domain_data?.problem_count_data?.difficulty_data?.find((d: any) => d.level === 'Hard')?.count || 0,
            ninja: code360?.data?.dsa_domain_data?.problem_count_data?.difficulty_data?.find((d: any) => d.level === 'Ninja')?.count || 0
          },
          userLevel: code360?.data?.user_level || 0,
          userLevelName: code360?.data?.user_level_name || "",
          userExp: code360?.data?.user_exp || 0,
          badges: code360?.data?.dsa_domain_data?.badges_hash || {},
          certificates: [],
          recentSubmissions: []
        },
        github: {
          name: "GitHub",
          handle: github?.name || "",
          followers: github?.followers || 0,
          repos: github?.repos || 0,
          contributions: null,
          languages: [],
          recentActivity: []
        }
      },

      // Contest Rankings
      contestRankings: {
        leetcode: {
          rating: Math.floor(leetcode?.contest?.rating || 0),
          maxRating: Math.floor(leetcode?.contest?.rating * 1.05 || 0), // Approximation
          globalRank: leetcode?.contest?.globalRanking || 0,
          attended: leetcode?.contest?.attended || 0
        },
        codechef: {
          rating: codechef?.rating ? parseInt(codechef.rating.replace(/[^\d]/g, '')) : 0,
          maxRating: codechef?.maxRating ? parseInt(codechef.maxRating) : 0,
          globalRank: null,
          attended: codechef?.contestsParticipated || 0
        },
        codeforces: {
          rating: codeforces?.rating || 0,
          maxRating: codeforces?.maxRating || 0,
          rank: codeforces?.rank || "Unrated",
          attended: 0
        }
      },

      // Awards
      awards: generateAwards({ github, leetcode, codeforces, gfg, codechef, code360 }),

      // Topic Analysis
      topicAnalysis: extractTopicAnalysis(gfg?.submissions || {}),

      // Recent Activity (placeholder - you'll need to implement this)
      recentActivity: [
        {
          platform: "GeeksforGeeks",
          problemName: "Latest Problem",
          difficulty: "Medium",
          status: "Solved",
          language: "cpp",
          timestamp: new Date().toISOString()
        }
      ],

      // Skills
      skills: {
        languages: ["C++", "Python", "JavaScript"],
        technologies: ["React", "Node.js", "MongoDB", "Express"],
        algorithms: ["Dynamic Programming", "Graph Algorithms", "Tree Traversal"],
        concepts: ["Data Structures", "Problem Solving", "Full Stack Development"]
      },

      // Preferences
      preferences: {
        defaultLanguage: "cpp",
        publicProfile: true,
        showEmail: false,
        notifications: {
          contests: true,
          achievements: true,
          weeklyProgress: true
        }
      }
    };

    return res.json(enhancedProfile);

  } catch (error) {
    console.error("Error fetching profiles:", error);
    return res.status(500).json({
      error: "Failed to fetch profile data",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
};