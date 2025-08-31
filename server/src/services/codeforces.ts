import axios from "axios";

export const fetchCodeforcesProfile = async (username: string) => {
  try {
    // Fetch user info
    const res = await axios.get(`https://codeforces.com/api/user.info?handles=${username}`);
    const user = res.data.result[0];

    // Fetch user submissions to count solved problems
    const submissionsRes = await axios.get(`https://codeforces.com/api/user.status?handle=${username}`);
    const submissions = submissionsRes.data.result;

    // Use a Set to track unique problems with verdict "OK"
    const solvedProblems = new Set();
    for (const submission of submissions) {
      if (submission.verdict === "OK") {
        const key = `${submission.problem.contestId}-${submission.problem.index}`;
        solvedProblems.add(key);
      }
    }

    return {
      platform: "Codeforces",
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      handle: user.handle,
      rating: user.rating,
      maxRating: user.maxRating,
      rank: user.rank,
      avatar: user.titlePhoto,
      solvedCount: solvedProblems.size, // 🎯 This is what you wanted!
    };
  } catch (err: any) {
    console.error("💀 Codeforces fetch error:", err.message);
    return null;
  }
};
