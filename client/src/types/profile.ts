// Updated ProfileData interface based on API response structure
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
  contestData?: {
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

// API response wrapper (what the API actually returns)
export interface PublicProfileResponse {
  profile: ProfileData;
  overview?: any;
  activityCalendar?: any;
  problemsSolved?: any;
  platforms?: any;
}

// Alternative: If the API returns flattened data sometimes
export type ProfileApiResponse = ProfileData | PublicProfileResponse;