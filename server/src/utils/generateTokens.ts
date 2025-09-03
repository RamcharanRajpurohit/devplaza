
import jwt from "jsonwebtoken";

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;


if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
  throw new Error("🚨 JWT secrets not defined in .env file");
}


type TokenGenerator = (payload: object) => string;// can define type of const var as well but then you dont need inline defination

export const generateAccessToken = (payload: object) => {//payload is var name of passed obj and its type is object for ts 
  return jwt.sign(payload, ACCESS_TOKEN_SECRET as string, { expiresIn: "30m" });
};
export const generateRefreshToken =(payload:object)=>{
  return jwt.sign(payload,REFRESH_TOKEN_SECRET as string,{expiresIn:"7d"})
};

export const generateAccessAndRefreshToken = (payload1 :object,payload2:object):TokenPair =>{
      return {accessToken:generateAccessToken(payload1),refreshToken:generateRefreshToken(payload2)};
}
