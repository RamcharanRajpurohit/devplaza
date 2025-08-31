// src/services/github.ts
import axios from "axios";

export const fetchGithubProfile = async (username: string) => {
  try {
    const res = await axios.get(`https://api.github.com/users/${username}`);
    return {
      platform: "GitHub",
      name: res.data.name,
      bio: res.data.bio,
      followers: res.data.followers,
      repos: res.data.public_repos,
      avatar: res.data.avatar_url,
    };
  } catch (err:any) {
    console.error("GitHub fetch error:", err.message);
    return null;
  }
};
