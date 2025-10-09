export default interface EnhancedProfileData {
  profile: {
    name: string;
    username: string;
    bio: string;
    avatar: string;
    location: string;
    institute: string;
    graduationYear: number;
    lastRefresh: string;
    portfolio: string;
    phone: string;
    email: string;
  };
  overview: {
    totalQuestions: number;
    totalActiveDays: number;
    totalContests: number;
    maxStreak: number;
    currentStreak: number;
  };
  problemsSolved: {
    dsa: {
      leetcode: {
        easy: number;
        medium: number;
        hard: number;
        total: number;
      };
      code360: {
        easy: number;
        medium: number;
        hard: number;
        total: number;
      };
      gfg: {
        easy: number;
        medium: number;
        hard: number;
        total: number;
      };
      // Aggregate totals across all DSA platforms
      total: {
        easy: number;
        medium: number;
        hard: number;
        overall: number;
      };
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
      totalSolved: number;
      rank?: string | number;
      url: string;
    };
  };
  topicAnalysis: {
    [key: string]: number;
  };
}