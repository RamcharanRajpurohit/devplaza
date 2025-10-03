
// API response wrapper (what the API actually returns)
export interface PublicProfileResponse {
  profile: ProfileData;
  overview?: any;
  activityCalendar?: any;
  problemsSolved?: any;
  platforms?: any;
}

// Alternative: If the API returns flattened data sometimes

export interface ProfileData {
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
export type ProfileApiResponse = ProfileData | PublicProfileResponse;