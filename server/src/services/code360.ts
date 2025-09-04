import axios from "axios";

export const fetchCode360Profile = async (uuid :string) => {


  try {
    const res = await axios.get(
      `https://www.naukri.com/code360/api/v3/public_section/profile/user_details`,
      {
        params: {
          uuid,
          request_differentiator: Date.now(),
          app_context: "publicsection",
          naukri_request: true,
        },
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/119.0.0.0 Safari/537.36",
          "Referer": "https://www.naukri.com/",
          "Accept": "application/json",
        },
      }
    );

    console.log("🔥 Success:", res.data);
    return res.data;
  } catch (error: any) {
    console.error("💀 Axios failed:", error.message);
    return null;
  }
};
