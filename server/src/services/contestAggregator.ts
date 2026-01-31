import axios from 'axios';

interface ContestData {
  platform: string;
  name: string;
  url: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  status: 'upcoming' | 'ongoing' | 'ended';
}

/**
 * Fetch contests from Codeforces
 */
export async function fetchCodeforcesContests(): Promise<ContestData[]> {
  try {
    const response = await axios.get('https://codeforces.com/api/contest.list');

    if (response.data.status !== 'OK') {
      console.error('Codeforces API error:', response.data);
      return [];
    }

    const contests: ContestData[] = [];
    const now = Date.now() / 1000; // Convert to seconds

    for (const contest of response.data.result) {
      const startTime = new Date(contest.startTimeSeconds * 1000);
      const endTime = new Date((contest.startTimeSeconds + contest.durationSeconds) * 1000);

      // Only include upcoming and ongoing contests
      if (contest.phase === 'BEFORE' || contest.phase === 'CODING') {
        contests.push({
          platform: 'codeforces',
          name: contest.name,
          url: `https://codeforces.com/contest/${contest.id}`,
          startTime,
          endTime,
          duration: contest.durationSeconds,
          status: contest.phase === 'BEFORE' ? 'upcoming' : 'ongoing',
        });
      }
    }

    return contests;
  } catch (error) {
    console.error('Error fetching Codeforces contests:', error);
    return [];
  }
}

/**
 * Fetch contests from CodeChef
 */
export async function fetchCodeChefContests(): Promise<ContestData[]> {
  try {
    const response = await axios.get('https://www.codechef.com/api/list/contests/all');

    const contests: ContestData[] = [];

    // Present (ongoing) contests
    if (response.data.present_contests) {
      for (const contest of response.data.present_contests) {
        const startTime = new Date(contest.contest_start_date_iso);
        const endTime = new Date(contest.contest_end_date_iso);
        const duration = (endTime.getTime() - startTime.getTime()) / 1000;

        contests.push({
          platform: 'codechef',
          name: contest.contest_name,
          url: `https://www.codechef.com/${contest.contest_code}`,
          startTime,
          endTime,
          duration,
          status: 'ongoing',
        });
      }
    }

    // Future contests
    if (response.data.future_contests) {
      for (const contest of response.data.future_contests) {
        const startTime = new Date(contest.contest_start_date_iso);
        const endTime = new Date(contest.contest_end_date_iso);
        const duration = (endTime.getTime() - startTime.getTime()) / 1000;

        contests.push({
          platform: 'codechef',
          name: contest.contest_name,
          url: `https://www.codechef.com/${contest.contest_code}`,
          startTime,
          endTime,
          duration,
          status: 'upcoming',
        });
      }
    }

    return contests;
  } catch (error) {
    console.error('Error fetching CodeChef contests:', error);
    return [];
  }
}

/**
 * Fetch contests from LeetCode
 */
export async function fetchLeetCodeContests(): Promise<ContestData[]> {
  try {
    const response = await axios.post(
      'https://leetcode.com/graphql/',
      {
        query: `
          query contestV2UpcomingContests {
            contestV2UpcomingContests {
              titleSlug
              title
              titleCn
              startTime
              duration
              cardImg
              cardImgApp
            }
          }
        `,
        variables: {},
        operationName: 'contestV2UpcomingContests',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
        },
      }
    );

    const contests: ContestData[] = [];
    const now = Date.now() / 1000;

    if (response.data?.data?.contestV2UpcomingContests) {
      for (const contest of response.data.data.contestV2UpcomingContests) {
        const startTime = new Date(contest.startTime * 1000);
        const endTime = new Date((contest.startTime + contest.duration) * 1000);

        contests.push({
          platform: 'leetcode',
          name: contest.title,
          url: `https://leetcode.com/contest/${contest.titleSlug}`,
          startTime,
          endTime,
          duration: contest.duration,
          status: contest.startTime > now ? 'upcoming' : 'ongoing',
        });
      }
    }

    return contests;
  } catch (error) {
    console.error('Error fetching LeetCode contests:', error);
    return [];
  }
}

/**
 * Fetch contests from AtCoder (using unofficial API)
 */
export async function fetchAtCoderContests(): Promise<ContestData[]> {
  try {
    const response = await axios.get('https://kenkoooo.com/atcoder/resources/contests.json');

    const contests: ContestData[] = [];
    const now = Date.now() / 1000;
    const oneYearInSeconds = 365 * 24 * 60 * 60; // Filter out permanent practice contests

    for (const contest of response.data) {
      // Skip practice contests (those with very long duration or start at epoch 0)
      if (contest.start_epoch_second === 0 || contest.duration_second > oneYearInSeconds) {
        continue;
      }

      // Only include actual contests (ABC, ARC, AGC, etc.)
      const contestId = contest.id.toLowerCase();
      const isActualContest = /^(abc|arc|agc|ahc)\d+/.test(contestId);

      if (!isActualContest) {
        continue;
      }

      const startTime = new Date(contest.start_epoch_second * 1000);
      const endTime = new Date((contest.start_epoch_second + contest.duration_second) * 1000);

      // Only include upcoming contests
      if (contest.start_epoch_second > now) {
        contests.push({
          platform: 'atcoder',
          name: contest.title,
          url: `https://atcoder.jp/contests/${contest.id}`,
          startTime,
          endTime,
          duration: contest.duration_second,
          status: 'upcoming',
        });
      } else if (contest.start_epoch_second + contest.duration_second > now) {
        // Ongoing
        contests.push({
          platform: 'atcoder',
          name: contest.title,
          url: `https://atcoder.jp/contests/${contest.id}`,
          startTime,
          endTime,
          duration: contest.duration_second,
          status: 'ongoing',
        });
      }
    }

    return contests;
  } catch (error) {
    console.error('Error fetching AtCoder contests:', error);
    return [];
  }
}

/**
 * Fetch contests from Naukri Code360
 */
export async function fetchNaukriContests(): Promise<ContestData[]> {
  try {
    const response = await axios.get(
      'https://www.naukri.com/code360/api/v4/public_section/contest_list',
      {
        params: {
          page_size: 10,
          page: 1,
          status: 'upcoming',
          'category[]': 'code_360',
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
          'Accept': 'application/json',
        },
      }
    );

    const contests: ContestData[] = [];

    if (response.data?.data?.events) {
      for (const event of response.data.data.events) {
        const startTime = new Date(event.event_start_time * 1000);
        const endTime = new Date(event.event_end_time * 1000);
        const duration = (endTime.getTime() - startTime.getTime()) / 1000;

        contests.push({
          platform: 'naukri',
          name: event.name,
          url: `https://www.naukri.com/code360/contests/${event.slug}`,
          startTime,
          endTime,
          duration,
          status: event.has_started ? 'ongoing' : 'upcoming',
        });
      }
    }

    return contests;
  } catch (error) {
    console.error('Error fetching Naukri contests:', error);
    return [];
  }
}

/**
 * Fetch contests from all platforms
 */
export async function fetchAllContests(): Promise<ContestData[]> {
  console.log('🔍 Fetching contests from all platforms...');

  const [codeforces, codechef, leetcode, atcoder, naukri] = await Promise.all([
    fetchCodeforcesContests(),
    fetchCodeChefContests(),
    fetchLeetCodeContests(),
    fetchAtCoderContests(),
    fetchNaukriContests(),
  ]);

  const allContests = [...codeforces, ...codechef, ...leetcode, ...atcoder, ...naukri];

  // Sort by start time
  allContests.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  console.log(`✅ Fetched ${allContests.length} contests total`);
  return allContests;
}
