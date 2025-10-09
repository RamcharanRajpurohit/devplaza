// src/services/activityCalendar.ts
interface PlatformSubmission {
  date: string;
  platform: string;
  count: number;
}

interface ActivityDay {
  date: string;
  count: number;
  level: number;
  platforms: string[];
}

export class ActivityCalendarService {
  
  /**
   * Generates a complete activity calendar for the past 365 days
   */
  static generateActivityCalendar(platformData: any): ActivityDay[] {
    const calendar: ActivityDay[] = [];
    const today = new Date();
    
    // Initialize 365 days
    for (let i = 365; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      calendar.push({
        date: dateString,
        count: 0,
        level: 0,
        platforms: []
      });
    }
    
    // Process submissions from all platforms
    const allSubmissions = this.aggregateSubmissions(platformData);
    
    // Fill calendar with actual data
    allSubmissions.forEach(submission => {
      const dayIndex = calendar.findIndex(day => day.date === submission.date);
      if (dayIndex !== -1) {
        calendar[dayIndex].count += submission.count;
        if (!calendar[dayIndex].platforms.includes(submission.platform)) {
          calendar[dayIndex].platforms.push(submission.platform);
        }
      }
    });
    
    // Calculate levels (0-4 based on activity intensity)
    const maxCount = Math.max(...calendar.map(day => day.count));
    calendar.forEach(day => {
      if (day.count === 0) day.level = 0;
      else if (day.count <= maxCount * 0.25) day.level = 1;
      else if (day.count <= maxCount * 0.5) day.level = 2;
      else if (day.count <= maxCount * 0.75) day.level = 3;
      else day.level = 4;
    });
    
    return calendar;
  }
  
  /**
   * Aggregate submissions from all platforms into a unified format
   */
  private static aggregateSubmissions(platformData: any): PlatformSubmission[] {
    const submissions: PlatformSubmission[] = [];
    
    // LeetCode submissions
    if (platformData.leetcode?.recentSubmissions) {
      platformData.leetcode.recentSubmissions.forEach((sub: any) => {
        const date = sub.timestamp.split('T')[0];
        submissions.push({
          date,
          platform: 'leetcode',
          count: 1
        });
      });
    }
    
    // GitHub commits
    if (platformData.github?.contributions) {
      platformData.github.contributions.forEach((day: any) => {
        if (day.count > 0) {
          submissions.push({
            date: day.date,
            platform: 'github',
            count: day.count
          });
        }
      });
    }
    
    // GeeksforGeeks submissions
    if (platformData.gfg?.submissions) {
      Object.values(platformData.gfg.submissions).forEach((difficultyGroup: any) => {
        Object.values(difficultyGroup).forEach((problem: any) => {
          if (problem.submissionDate) {
            submissions.push({
              date: problem.submissionDate.split('T')[0],
              platform: 'geeksforgeeks',
              count: 1
            });
          }
        });
      });
    }
    
    // Codeforces submissions (if available)
    if (platformData.codeforces?.recentSubmissions) {
      platformData.codeforces.recentSubmissions.forEach((sub: any) => {
        submissions.push({
          date: sub.date,
          platform: 'codeforces',
          count: 1
        });
      });
    }
    
    return submissions;
  }
  
  /**
   * Calculate streak statistics
   */
  static calculateStreaks(calendar: ActivityDay[]) {
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;
    
    // Sort calendar by date (newest first for current streak)
    const sortedCalendar = [...calendar].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    // Calculate current streak
    for (const day of sortedCalendar) {
      if (day.count > 0) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    // Calculate max streak
    const chronologicalCalendar = [...calendar].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    for (const day of chronologicalCalendar) {
      if (day.count > 0) {
        tempStreak++;
        maxStreak = Math.max(maxStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }
    
    return { currentStreak, maxStreak };
  }
  
  /**
   * Get monthly activity summary
   */
  static getMonthlyActivity(calendar: ActivityDay[]) {
    const monthlyData: { [key: string]: { total: number; days: number } } = {};
    
    calendar.forEach(day => {
      const monthKey = day.date.substring(0, 7); // YYYY-MM
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { total: 0, days: 0 };
      }
      
      monthlyData[monthKey].total += day.count;
      if (day.count > 0) {
        monthlyData[monthKey].days++;
      }
    });
    
    return monthlyData;
  }
  
  /**
   * Generate mock data when real data is not available
   */
  static generateMockActivity(): ActivityDay[] {
    const calendar: ActivityDay[] = [];
    const today = new Date();
    
    for (let i = 365; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      // Create realistic activity pattern
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      // Less activity on weekends
      const activityProbability = isWeekend ? 0.3 : 0.6;
      const shouldHaveActivity = Math.random() < activityProbability;
      
      let count = 0;
      let level = 0;
      const platforms: string[] = [];
      
      if (shouldHaveActivity) {
        count = Math.floor(Math.random() * 8) + 1;
        
        // Randomly assign platforms
        const availablePlatforms = ['leetcode', 'github', 'geeksforgeeks', 'codeforces'];
        const numPlatforms = Math.floor(Math.random() * 3) + 1;
        
        for (let j = 0; j < numPlatforms; j++) {
          const randomPlatform = availablePlatforms[Math.floor(Math.random() * availablePlatforms.length)];
          if (!platforms.includes(randomPlatform)) {
            platforms.push(randomPlatform);
          }
        }
        
        // Calculate level based on count
        if (count <= 2) level = 1;
        else if (count <= 4) level = 2;
        else if (count <= 6) level = 3;
        else level = 4;
      }
      
      calendar.push({
        date: dateString,
        count,
        level,
        platforms
      });
    }
    
    return calendar;
  }
}