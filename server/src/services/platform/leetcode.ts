import axios from "axios";

export const fetchLeetcodeProfile = async (username: string) => {
  try {
    const query = {
      query: `
        query getUserProfile($username: String!) {
          matchedUser(username: $username) {
            username
            profile {
              realName
              userAvatar
              aboutMe
              countryName
              reputation
              ranking
            }
            submitStatsGlobal {
              acSubmissionNum {
                difficulty
                count
              }
            }
            userCalendar {
              streak
              totalActiveDays
              activeYears
            }
            tagProblemCounts {
              advanced {
                tagName
                tagSlug
                problemsSolved
              }
              intermediate {
                tagName
                tagSlug
                problemsSolved
              }
              fundamental {
                tagName
                tagSlug
                problemsSolved
              }
            }
          }
          userContestRanking(username: $username) {
            attendedContestsCount
            rating
            globalRanking
            totalParticipants
            topPercentage
          }
          recentAcSubmissionList(username: $username, limit: 10) {
            id
            title
            titleSlug
            timestamp
          }
        }`,
      variables: { username },
    };

    const res = await axios.post("https://leetcode.com/graphql", query, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = res.data.data;
    const user = data.matchedUser;
    const contest = data.userContestRanking;

    if (!user) return null;

    const acStats = user.submitStatsGlobal.acSubmissionNum;
    const getCount = (level: string) =>
      acStats.find((x: any) => x.difficulty === level)?.count || 0;

    // Extract topic analysis from tagProblemCounts
    const topicAnalysis: { [key: string]: number } = {};
    
    ['advanced', 'intermediate', 'fundamental'].forEach(level => {
      user.tagProblemCounts?.[level]?.forEach((tag: any) => {
        if (tag.problemsSolved > 0) {
          topicAnalysis[tag.tagSlug] = (topicAnalysis[tag.tagSlug] || 0) + tag.problemsSolved;
        }
      });
    });

    return {
      platform: "LeetCode",
      name: user.profile.realName,
      about: user.profile.aboutMe,
      country: user.profile.countryName,
      avatar: user.profile.userAvatar,
      rank: user.profile.ranking,
      reputation: user.profile.reputation,
      easySolved: getCount("Easy"),
      mediumSolved: getCount("Medium"),
      hardSolved: getCount("Hard"),
      totalSolved: getCount("All"),
      contest: {
        attended: contest?.attendedContestsCount || 0,
        rating: contest?.rating || 0,
        globalRanking: contest?.globalRanking || 0,
        topPercentage: contest?.topPercentage || 0,
      },
      calendar: {
        streak: user.userCalendar?.streak || 0,
        totalActiveDays: user.userCalendar?.totalActiveDays || 0,
        activeYears: user.userCalendar?.activeYears || [],
      },
      topicAnalysis: topicAnalysis,
      recentSubmissions: data.recentAcSubmissionList || [],
    };
  } catch (err: any) {
    console.error("LeetCode fetch error:", err.message);
    return null;
  }
};