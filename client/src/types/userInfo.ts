export default interface UserInfoFormData {
  fullName: string;
  bio: string;
  location: string;
  phone: string;
  email: string;
  portfolio: string;
  institute: string;
  graduationYear: string;
  links: {
    github: string;
    linkedin: string;
    twitter: string;
    instagram: string;
    gfg: string;
    leetcode: string;
    codechef: string;
    code360: string;
    codeforces: string;
    hackerrank: string;
  };
  skills: string[];
  experience: {
    years: string;
    currentRole: string;
    company: string;
  };
}