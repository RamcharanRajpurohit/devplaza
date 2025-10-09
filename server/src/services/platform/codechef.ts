import axios from "axios";
import * as cheerio from "cheerio";

export const fetchCodechefProfile = async (username: string) => {
  try {
    const res = await axios.get(`https://www.codechef.com/users/${username}`);
    const $ = cheerio.load(res.data);

    const name = $(".user-name-box span").first().text().trim() || username;
    const rating = $(".rating-number").first().text().trim();
    const stars = $(".rating-star").text().trim();
    const maxRatingText = $(".rating-header small").text().trim();
    const maxRating = maxRatingText.match(/(\d+)/)?.[0] || null;

    const globalRank = $('strong:contains("Global Rank")')
      .next()
      .text()
      .replace(/\D/g, "")
      .trim();

    const countryRank = $('strong:contains("Country Rank")')
      .next()
      .text()
      .replace(/\D/g, "")
      .trim();

    const contestCount = $("section.rating-data-section table tbody tr").length;

    const problemsSolvedText = $("section.problems-solved h5").text().trim();
    const problemsSolved = problemsSolvedText.match(/\d+/)?.[0] || "0";

    return {
      platform: "CodeChef",
      name,
      handle: username,
      rating,
      maxRating,
      stars,
      globalRank,
      countryRank,
      contestsParticipated: contestCount,
      problemsSolved,
    };
  } catch (err: any) {
    console.error("CodeChef fetch error:", err.message);
    return null;
  }
};
