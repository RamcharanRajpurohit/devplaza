import axios from "axios";

export const fetchCodeforcesProfile = async (username: string) => {
  try {
    // Fetch user info
    const res = await axios.get(`https://codeforces.com/api/user.info?handles=${username}`);
    const user = res.data.result[0];

    // Fetch user submissions to count solved problems
    const submissionsRes = await axios.get(`https://codeforces.com/api/user.status?handle=${username}&from=1&count=10000`);
    const submissions = submissionsRes.data.result;

    // Track unique problems with verdict "OK"
    const solvedProblems = new Set();
    const difficultyCount: { [key: string]: number } = {};
    const topicCount: { [key: string]: number } = {};
    const languageCount: { [key: string]: number } = {};
    
    // Track problem solving by rating range
    const ratingDistribution: { [key: string]: number } = {
      '800-1000': 0,
      '1100-1300': 0,
      '1400-1600': 0,
      '1700-1900': 0,
      '2000-2200': 0,
      '2300+': 0
    };

    for (const submission of submissions) {
      if (submission.verdict === "OK") {
        const key = `${submission.problem.contestId}-${submission.problem.index}`;
        
        // Only count first AC submission for each problem
        if (!solvedProblems.has(key)) {
          solvedProblems.add(key);
          
          // Count by difficulty/rating
          const rating = submission.problem.rating;
          if (rating) {
            if (rating <= 1000) ratingDistribution['800-1000']++;
            else if (rating <= 1300) ratingDistribution['1100-1300']++;
            else if (rating <= 1600) ratingDistribution['1400-1600']++;
            else if (rating <= 1900) ratingDistribution['1700-1900']++;
            else if (rating <= 2200) ratingDistribution['2000-2200']++;
            else ratingDistribution['2300+']++;
          }
          
          // Count by topics/tags
          submission.problem.tags?.forEach((tag: string) => {
            topicCount[tag] = (topicCount[tag] || 0) + 1;
          });
        }
      }
      
      // Count programming languages used
      if (submission.programmingLanguage) {
        languageCount[submission.programmingLanguage] = 
          (languageCount[submission.programmingLanguage] || 0) + 1;
      }
    }

    // Fetch contest participation
    const ratingRes = await axios.get(`https://codeforces.com/api/user.rating?handle=${username}`);
    const contests = ratingRes.data.result;

    // Calculate contest statistics
    const contestStats = {
      totalContests: contests.length,
      bestRank: contests.length > 0 ? Math.min(...contests.map((c: any) => c.rank)) : null,
      ratingChanges: contests.map((c: any) => ({
        contestName: c.contestName,
        rank: c.rank,
        oldRating: c.oldRating,
        newRating: c.newRating,
        ratingChange: c.newRating - c.oldRating,
      })),
    };

    // Get recent contest activity (last 5 contests)
    const recentContests = contests.slice(-5).reverse();

    return {
      platform: "Codeforces",
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      handle: user.handle,
      rating: user.rating,
      maxRating: user.maxRating,
      rank: user.rank,
      maxRank: user.maxRank,
      avatar: user.titlePhoto,
      country: user.country,
      organization: user.organization,
      contribution: user.contribution,
      friendOfCount: user.friendOfCount,
      solvedCount: solvedProblems.size,
      ratingDistribution: ratingDistribution,
      topicAnalysis: topicCount,
      languageStats: languageCount,
      contests: {
        total: contestStats.totalContests,
        bestRank: contestStats.bestRank,
        recentContests: recentContests.map((c: any) => ({
          name: c.contestName,
          rank: c.rank,
          ratingChange: c.newRating - c.oldRating,
        })),
      },
    };
  } catch (err: any) {
    console.error("💀 Codeforces fetch error:", err.message);
    return null;
  }
};