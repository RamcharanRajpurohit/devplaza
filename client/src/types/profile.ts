export interface ProfileData {
  username: string;
  fullName: string;
  email?: string;
  location?: string;
  institution?: string;
  platformStats: {
    name: string;
    rank: number;
    maxRank: number;
    problems?: number;
  }[];
  contestData: {
    name: string;
    count: number;
  }[];
  dsaTopics: {
    name: string;
    solved: number;
    total: number;
  }[];
  totalQuestions: number;
  totalActiveDays: number;
  totalContests: number;
  viewCount: number;
  lastRefresh: string;
  awards: number;
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
}

