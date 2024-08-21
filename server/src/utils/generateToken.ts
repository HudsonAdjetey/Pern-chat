import jwt from "jsonwebtoken";
import { Response } from "express";

const generateToken = (userId: string, res: Response): {} | void => {
  const token = jwt.sign(
    {
      userId,
    },
    process.env.JWT_SECRET!,
    {
      expiresIn: "15h",
    }
  );
  res.cookie("access", token, {
    httpOnly: true,
    maxAge: 15 * 60 * 60 * 1000,
    sameSite: "strict", //
    secure: process.env.NODE_ENV! === "production",
  });

  return token;
};

export default generateToken;
