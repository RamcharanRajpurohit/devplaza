export default interface EnhancedProfileData {
  profile: {
    name: string;
    username: string;
    bio: string;
    avatar: string;
    location: string;
    institute: string;
    graduationYear: number;
    profileViews: number;
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
      totalSolved: number;
      rank?: string | number;
      url: string;
    };
  };
  awards: Array<{
    id: string;
    title: string;
    icon: string;
    color: string;
  }>;
  topicAnalysis: {
    [key: string]: number;
  };
}
