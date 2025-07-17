import jwt from "jsonwebtoken";

const JWT_SECRET = "your_jwt_secret_here"; // env later

export const generateToken = (payload: object) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};
