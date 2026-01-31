import axios from 'axios';
import { IProblemOfTheDay } from '../models/potd';

interface ScrapedProblem {
  platform: string;
  title: string;
  url: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  description?: string;
  tags?: string[];
}

/**
 * Scrape LeetCode Problem of the Day using GraphQL API
 */
export async function scrapeLeetCode(): Promise<ScrapedProblem | null> {
  try {
    const response = await axios.post(
      'https://leetcode.com/graphql/',
      {
        query: `
          query questionOfTodayV2 {
            activeDailyCodingChallengeQuestion {
              date
              userStatus
              link
              question {
                id: questionId
                titleSlug
                title
                translatedTitle
                questionFrontendId
                paidOnly: isPaidOnly
                difficulty
                topicTags {
                  name
                  slug
                  nameTranslated: translatedName
                }
                status
                isInMyFavorites: isFavor
                acRate
                frequency: freqBar
              }
            }
          }
        `,
        variables: {},
        operationName: 'questionOfTodayV2',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
        },
      }
    );

    const data = response.data?.data?.activeDailyCodingChallengeQuestion;
    if (!data) return null;

    return {
      platform: 'leetcode',
      title: data.question.title,
      url: `https://leetcode.com${data.link}`,
      difficulty: data.question.difficulty as 'Easy' | 'Medium' | 'Hard',
      tags: data.question.topicTags?.map((tag: any) => tag.name) || [],
      description: `Problem #${data.question.questionFrontendId} - Acceptance Rate: ${Math.round(data.question.acRate)}%`,
    };
  } catch (error) {
    console.error('Error scraping LeetCode POTD:', error);
    return null;
  }
}

/**
 * Scrape GeeksforGeeks Problem of the Day using their API
 */
export async function scrapeGeeksForGeeks(): Promise<ScrapedProblem | null> {
  try {
    const response = await axios.get(
      'https://practiceapi.geeksforgeeks.org/api/vr/problems-of-day/problem/today/',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
          'Accept': 'application/json',
        },
      }
    );

    const data = response.data;
    if (!data || !data.problem_name) return null;

    return {
      platform: 'geeksforgeeks',
      title: data.problem_name,
      url: data.problem_url,
      difficulty: data.difficulty as 'Easy' | 'Medium' | 'Hard',
      tags: [
        ...(data.tags?.topic_tags || []),
        ...(data.tags?.company_tags || []),
      ],
      description: `Accuracy: ${data.accuracy}% | Submissions: ${data.total_submissions}`,
    };
  } catch (error) {
    console.error('Error scraping GFG POTD:', error);
    return null;
  }
}

/**
 * Scrape Naukri Code360 Problems of the Day using their API
 */
export async function scrapeNaukri(): Promise<ScrapedProblem[]> {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const timestamp = Date.now();

    const response = await axios.get(
      `https://www.naukri.com/code360/api/v3/public_section/potd/problem_list`,
      {
        params: {
          date: today,
          phase_two: true,
          request_differentiator: timestamp,
          app_context: 'publicsection',
          naukri_request: true,
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
          'Accept': 'application/json',
        },
      }
    );

    const data = response.data?.data?.details;
    if (!data) return [];

    const problems: ScrapedProblem[] = [];

    // Easy Problem
    if (data.EASY?.problem) {
      const p = data.EASY.problem;
      problems.push({
        platform: 'naukri',
        title: `${p.name} (Easy)`,
        url: `https://www.naukri.com/code360/problems/${p.slug}`,
        difficulty: 'Easy',
        tags: p.practice_topics || [],
        description: `Avg Time: ${p.avg_time_to_solve}m | Submissions: ${p.submission_count} | Score: ${p.max_score}`,
      });
    }

    // Moderate Problem
    if (data.MODERATE?.problem) {
      const p = data.MODERATE.problem;
      problems.push({
        platform: 'naukri',
        title: `${p.name} (Moderate)`,
        url: `https://www.naukri.com/code360/problems/${p.slug}`,
        difficulty: 'Medium',
        tags: p.practice_topics || [],
        description: `Avg Time: ${p.avg_time_to_solve}m | Submissions: ${p.submission_count} | Score: ${p.max_score}`,
      });
    }

    // Hard Problem
    if (data.HARD?.problem) {
      const p = data.HARD.problem;
      problems.push({
        platform: 'naukri',
        title: `${p.name} (Hard)`,
        url: `https://www.naukri.com/code360/problems/${p.slug}`,
        difficulty: 'Hard',
        tags: p.practice_topics || [],
        description: `Avg Time: ${p.avg_time_to_solve}m | Submissions: ${p.submission_count} | Score: ${p.max_score}`,
      });
    }

    return problems;
  } catch (error) {
    console.error('Error scraping Naukri POTD:', error);
    return [];
  }
}

/**
 * Scrape all platforms
 */
export async function scrapeAllPOTDs(): Promise<ScrapedProblem[]> {
  const problems: ScrapedProblem[] = [];

  // Scrape all platforms in parallel
  const [leetcode, gfg, naukri] = await Promise.all([
    scrapeLeetCode(),
    scrapeGeeksForGeeks(),
    scrapeNaukri(),
  ]);

  if (leetcode) problems.push(leetcode);
  if (gfg) problems.push(gfg);
  if (naukri) problems.push(...naukri);

  return problems;
}
