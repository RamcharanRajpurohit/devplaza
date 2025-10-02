import { fetchGithubProfile } from "../services/github";
import { fetchLeetcodeProfile } from "../services/leetcode";
import { fetchCodeforcesProfile } from "../services/codeforces";
import { fetchGFGUserData } from "../services/gfg";
import { Request, Response } from "express";
import { fetchCodechefProfile } from "../services/codechef";
import { fetchCode360Profile } from "../services/code360";
import { User } from "../models/user";
import { UserInfo } from "../models/userInfo";
import type EnhancedProfileData from "../types/enhanceData";

interface ProfileParams {
  username: string;
}

// Helper function to merge topic analysis from all platforms
const mergeTopicAnalysis = (
  gfgSubmissions: any,
  leetcodeTopics: any,
  codeforcesTopics: any
): { [key: string]: number } => {
  const topics: { [key: string]: number } = {};
  
  // Topic mapping for normalization
  const topicMapping: { [key: string]: string } = {
    'arrays': 'array',
    'array': 'array',
    'dp': 'dynamicProgramming',
    'dynamic programming': 'dynamicProgramming',
    'dynamicprogramming': 'dynamicProgramming',
    'trees': 'tree',
    'tree': 'tree',
    'binary tree': 'tree',
    'graphs': 'graph',
    'graph': 'graph',
    'dfs and bfs': 'graph',
    'strings': 'string',
    'string': 'string',
    'sorting': 'sorting',
    'greedy': 'greedy',
    'math': 'math',
    'number theory': 'math',
    'binary search': 'searching',
    'searching': 'searching',
    'linked list': 'linkedList',
    'linkedlist': 'linkedList',
    'stack': 'stack',
    'queue': 'queue',
    'heap': 'heap',
    'hashing': 'hashing',
    'backtracking': 'backtracking',
    'two pointers': 'twoPointers',
    'sliding window': 'slidingWindow',
    'bit manipulation': 'bitManipulation',
    'bitmasks': 'bitManipulation',
  };

  // Extract from GFG (keyword-based)
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

  Object.entries(gfgSubmissions).forEach(([difficulty, problems]: [string, any]) => {
    Object.values(problems).forEach((problem: any) => {
      const problemName = problem.pname?.toLowerCase() || '';
      
      Object.entries(topicKeywords).forEach(([topic, keywords]) => {
        if (keywords.some(keyword => problemName.includes(keyword))) {
          topics[topic] = (topics[topic] || 0) + 1;
        }
      });
    });
  });

  // Merge LeetCode topics
  Object.entries(leetcodeTopics || {}).forEach(([topic, count]: [string, any]) => {
    const normalized = topicMapping[topic.toLowerCase()] || topic.replace(/[-\s]/g, '');
    topics[normalized] = (topics[normalized] || 0) + count;
  });

  // Merge Codeforces topics
  Object.entries(codeforcesTopics || {}).forEach(([topic, count]: [string, any]) => {
    const normalized = topicMapping[topic.toLowerCase()] || topic.replace(/[-\s]/g, '');
    topics[normalized] = (topics[normalized] || 0) + count;
  });

  return topics;
};

// Helper function to generate awards based on achievements
const generateAwards = (data: any) => {
  const awards = [];
  
  const totalSolved = 
    (data.leetcode?.totalSolved || 0) +
    (data.gfg?.userInfo?.total_problems_solved || 0) +
    (data.codeforces?.solvedCount || 0) +
    (data.codechef?.problemsSolved ? parseInt(data.codechef.problemsSolved) : 0) +
    (data.code360?.data?.dsa_domain_data?.problem_count_data?.total_count || 0);

  // Problem Solver Awards
  if (totalSolved > 500) {
    awards.push({
      id: 'elite_problem_solver',
      title: 'Elite Problem Solver',
      icon: '👑',
      color: 'gold'
    });
  } else if (totalSolved > 100) {
    awards.push({
      id: 'problem_solver',
      title: 'Problem Solver',
      icon: '🏆',
      color: 'gold'
    });
  }

  // Contest Awards
  const totalContests = 
    (data.leetcode?.contest?.attended || 0) +
    (data.codechef?.contestsParticipated || 0) +
    (data.codeforces?.contests?.total || 0);

  if (totalContests > 50) {
    awards.push({
      id: 'contest_legend',
      title: 'Contest Legend',
      icon: '⚔️',
      color: 'red'
    });
  } else if (totalContests > 10) {
    awards.push({
      id: 'contest_warrior',
      title: 'Contest Warrior',
      icon: '⚔️',
      color: 'purple'
    });
  }

  // Multi-Platform Award
  const activePlatforms = [
    data.github, data.leetcode, data.codeforces, 
    data.gfg, data.codechef, data.code360
  ].filter(platform => platform && Object.keys(platform).length > 0).length;

  if (activePlatforms >= 4) {
    awards.push({
      id: 'multi_platform',
      title: 'Multi-Platform Coder',
      icon: '🌟',
      color: 'blue'
    });
  }

  // GitHub Star Award
  if (data.github?.stats?.totalStars > 50) {
    awards.push({
      id: 'github_star',
      title: 'GitHub Star',
      icon: '⭐',
      color: 'yellow'
    });
  }

  // Rating-based Awards
  if (data.codeforces?.rating > 1900 || data.leetcode?.contest?.rating > 2000) {
    awards.push({
      id: 'competitive_master',
      title: 'Competitive Master',
      icon: '🎯',
      color: 'red'
    });
  }

  // Streak Award
  const maxStreak = Math.max(
    data.gfg?.userInfo?.pod_solved_longest_streak || 0,
    data.leetcode?.calendar?.streak || 0
  );

  if (maxStreak > 30) {
    awards.push({
      id: 'streak_master',
      title: 'Streak Master',
      icon: '🔥',
      color: 'orange'
    });
  }

  return awards;
};

export const showProfile = async (req: Request<ProfileParams>, res: Response) => {
  try {
    const { username } = req.params;
    console.log("📡 Fetching profile for:", username);

    // Find base user
    const userData = await User.findOne({ username });
    

    // Find userInfo by reference
    const userInfoData = await UserInfo.findOne({ user: userData?._id });
    

    if (!userData || !userInfoData) {
      console.warn("⚠️ User not found:", username);
      return res.status(404).json({ error: "User not found" });
    }

    // Ensure links exist
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

    // Fetch all profiles in parallel
    const [github, leetcode, codeforces, gfg, codechef, code360] =
      await Promise.all([
        fetchGithubProfile(userInfoData.links.github),
        fetchLeetcodeProfile(userInfoData.links.leetcode),
        fetchCodeforcesProfile(userInfoData.links.codeforces),
        fetchGFGUserData(userInfoData.links.gfg),
        fetchCodechefProfile(userInfoData.links.codechef),
        fetchCode360Profile(userInfoData.links.code360),
      ]);

   

    // Extract platform-specific problem counts
    const leetcodeEasy = leetcode?.easySolved || 0;
    const leetcodeMedium = leetcode?.mediumSolved || 0;
    const leetcodeHard = leetcode?.hardSolved || 0;
    const leetcodeTotal = leetcode?.totalSolved || 0;

    const gfgEasy = Object.keys(gfg?.submissions?.Easy || {}).length;
    const gfgMedium = Object.keys(gfg?.submissions?.Medium || {}).length;
    const gfgHard = Object.keys(gfg?.submissions?.Hard || {}).length;
    const gfgTotal = gfg?.userInfo?.total_problems_solved || 0;

    const code360Easy = code360?.data?.dsa_domain_data?.problem_count_data?.difficulty_data?.find((d: any) => d.level === 'Easy')?.count || 0;
    const code360Medium = code360?.data?.dsa_domain_data?.problem_count_data?.difficulty_data?.find((d: any) => d.level === 'Moderate')?.count || 0;
    const code360Hard = code360?.data?.dsa_domain_data?.problem_count_data?.difficulty_data?.find((d: any) => d.level === 'Hard')?.count || 0;
    const code360Total = code360?.data?.dsa_domain_data?.problem_count_data?.total_count || 0;

    // Calculate aggregate totals
    const totalEasy = leetcodeEasy + gfgEasy + code360Easy;
    const totalMedium = leetcodeMedium + gfgMedium + code360Medium;
    const totalHard = leetcodeHard + gfgHard + code360Hard;
    const totalDSA = leetcodeTotal + gfgTotal + code360Total;

    // Calculate derived metrics
    const totalProblemsAllPlatforms = 
      totalDSA +
      (codeforces?.solvedCount || 0) +
      (codechef?.problemsSolved ? parseInt(codechef.problemsSolved) : 0);

    const totalContests = 
      (leetcode?.contest?.attended || 0) +
      (codechef?.contestsParticipated || 0) +
      (codeforces?.contests?.total || 0);

    const totalActiveDays = 
      (leetcode?.calendar?.totalActiveDays || 0) +
      (github?.activity?.recentActiveDays || 0);

    const maxStreak = Math.max(
      gfg?.userInfo?.pod_solved_longest_streak || 0,
      leetcode?.calendar?.streak || 0
    );

    const currentStreak = leetcode?.calendar?.streak || 0;

    // Merge topic analysis from all platforms
    const mergedTopics = mergeTopicAnalysis(
      gfg?.submissions || {},
      leetcode?.topicAnalysis || {},
      codeforces?.topicAnalysis || {}
    );

    // Build response matching EnhancedProfileData interface
    const enhancedProfile: EnhancedProfileData = {
      profile: {
        name: code360?.data?.name || github?.name || userData?.username || null,
        username: username,
        bio: github?.bio || code360?.data?.about || null,
        avatar: github?.avatar || code360?.data?.image || null,
        location: github?.location || leetcode?.country || codeforces?.country || null,
        institute: code360?.data?.college || null,
        graduationYear: code360?.data?.graduation_year || null,
        lastRefresh: new Date().toISOString().split('T')[0],
        portfolio: github?.blog || userInfoData?.portfolio || "",
        phone: userInfoData?.phone || "",
        email: userData?.email || ""
      },

      overview: {
        totalQuestions: totalProblemsAllPlatforms,
        totalActiveDays: totalActiveDays,
        totalContests: totalContests,
        maxStreak: maxStreak,
        currentStreak: currentStreak
      },

      problemsSolved: {
        dsa: {
          leetcode: {
            easy: leetcodeEasy,
            medium: leetcodeMedium,
            hard: leetcodeHard,
            total: leetcodeTotal
          },
          code360: {
            easy: code360Easy,
            medium: code360Medium,
            hard: code360Hard,
            total: code360Total
          },
          gfg: {
            easy: gfgEasy,
            medium: gfgMedium,
            hard: gfgHard,
            total: gfgTotal
          },
          total: {
            easy: totalEasy,
            medium: totalMedium,
            hard: totalHard,
            overall: totalDSA
          }
        },
        competitiveProgramming: {
          codechef: codechef?.problemsSolved ? parseInt(codechef.problemsSolved) : 0,
          codeforces: codeforces?.solvedCount || 0,
          total: (codechef?.problemsSolved ? parseInt(codechef.problemsSolved) : 0) + (codeforces?.solvedCount || 0)
        }
      },

      platforms: {
        leetcode: {
          name: "LeetCode",
          handle: leetcode?.name || null,
          rating: leetcode?.contest?.rating || null,
          maxRating: leetcode?.contest?.rating || null,
          totalSolved: leetcode?.totalSolved || 0,
          rank: leetcode?.rank || null,
          url: userInfoData.links.leetcode
        },
        codeforces: {
          name: "Codeforces",
          handle: codeforces?.handle || null,
          rating: codeforces?.rating || null,
          maxRating: codeforces?.maxRating || null,
          totalSolved: codeforces?.solvedCount || 0,
          rank: codeforces?.rank || null,
          url: userInfoData.links.codeforces
        },
        codechef: {
          name: "CodeChef",
          handle: codechef?.handle || "",
          rating: Number(codechef?.rating),
          maxRating: Number(codechef?.maxRating),
          totalSolved: codechef?.problemsSolved ? parseInt(codechef.problemsSolved) : 0,
          rank: codechef?.stars,
          url: userInfoData.links.codechef
        },
        geeksforgeeks: {
          name: "GeeksforGeeks",
          handle: gfg?.userInfo?.name || null,
          rating: gfg?.userInfo?.score || null,
          maxRating: undefined,
          totalSolved: gfg?.userInfo?.total_problems_solved || 0,
          rank: gfg?.userInfo?.institute_rank || null,
          url: userInfoData.links.gfg
        },
        code360: {
          name: "Code360",
          handle: code360?.data?.name || null,
          rating: code360?.data?.user_exp || null,
          maxRating: undefined,
          totalSolved: code360?.data?.dsa_domain_data?.problem_count_data?.total_count || 0,
          rank: code360?.data?.user_level_name || null,
          url: userInfoData.links.code360
        },
        github: {
          name: "GitHub",
          handle: github?.name || null,
          rating: github?.stats?.totalStars || undefined,
          maxRating: undefined,
          totalSolved: github?.repos || 0,
          rank: undefined,
          url: userInfoData.links.github
        }
      },

      awards: generateAwards({ github, leetcode, codeforces, gfg, codechef, code360 }),

      topicAnalysis: mergedTopics
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