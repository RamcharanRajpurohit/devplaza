import axios from "axios";
import * as cheerio from "cheerio";

export const fetchGFGUserData = async (username: string) => {
  try {
    const res = await axios.get(`https://www.geeksforgeeks.org/user/${username}`);
    const $ = cheerio.load(res.data);

    const rawJson = $("#__NEXT_DATA__").html();
    if (!rawJson) throw new Error("User data not found in script");

    const parsed = JSON.parse(rawJson);
    const userInfo = parsed.props?.pageProps?.userInfo;
    const submissions = parsed.props?.pageProps?.userSubmissionsInfo;
    return { userInfo, submissions };
  } catch (err:any) {
    console.error("Failed to fetch GFG data:", err.message);
    return null;
  }
};
