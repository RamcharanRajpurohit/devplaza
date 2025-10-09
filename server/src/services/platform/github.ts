import axios from "axios";

export const fetchGithubProfile = async (username: string) => {
  try {
    // Fetch user profile
    const userRes = await axios.get(`https://api.github.com/users/${username}`);
    
    // Fetch user's repositories with additional details
    const reposRes = await axios.get(
      `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`
    );

    // Calculate repository statistics
    const repos = reposRes.data;
    const totalStars = repos.reduce((sum: number, repo: any) => sum + repo.stargazers_count, 0);
    const totalForks = repos.reduce((sum: number, repo: any) => sum + repo.forks_count, 0);
    
    // Get language statistics
    const languages: { [key: string]: number } = {};
    repos.forEach((repo: any) => {
      if (repo.language) {
        languages[repo.language] = (languages[repo.language] || 0) + 1;
      }
    });

    // Get top repositories by stars
    const topRepos = repos
      .filter((repo: any) => !repo.fork)
      .sort((a: any, b: any) => b.stargazers_count - a.stargazers_count)
      .slice(0, 5)
      .map((repo: any) => ({
        name: repo.name,
        description: repo.description,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        language: repo.language,
        url: repo.html_url,
      }));

    // Calculate contribution streak (approximate from recent activity)
    const eventsRes = await axios.get(
      `https://api.github.com/users/${username}/events/public?per_page=100`
    );
    
    const recentEvents = eventsRes.data;
    const uniqueDays = new Set(
      recentEvents.map((event: any) => 
        new Date(event.created_at).toISOString().split('T')[0]
      )
    );

    return {
      platform: "GitHub",
      name: userRes.data.name,
      bio: userRes.data.bio,
      followers: userRes.data.followers,
      following: userRes.data.following,
      repos: userRes.data.public_repos,
      avatar: userRes.data.avatar_url,
      location: userRes.data.location,
      company: userRes.data.company,
      blog: userRes.data.blog,
      twitter: userRes.data.twitter_username,
      createdAt: userRes.data.created_at,
      stats: {
        totalStars: totalStars,
        totalForks: totalForks,
        totalRepos: userRes.data.public_repos,
        gists: userRes.data.public_gists,
      },
      languages: languages,
      topRepositories: topRepos,
      activity: {
        recentActiveDays: uniqueDays.size,
        lastUpdated: recentEvents[0]?.created_at || null,
      },
    };
  } catch (err: any) {
    console.error("GitHub fetch error:", err.message);
    return null;
  }
};