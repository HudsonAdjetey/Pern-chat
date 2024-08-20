import jwt, { JwtPayload } from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { Response, Request } from "express";
import prisma from "../db/prisma";

interface DecodedToken extends JwtPayload {
  userId: string;
}
declare global {
  namespace Express {
    export interface Request {
      user: {
        id: string;
      };
    }
  }
}

const protectRoute = asyncHandler(async (req: Request, res: Response, next) => {
  try {
    const token = req.cookies.access;
    if (!token) {
      res.status(401).json({
        success: false,
        message: "Unauthorized ",
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
    if (!decoded) {
      res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        fullName: true,
        profilePic: true,
        gender: true,
      },
    });
    if (!user) {
      res.status(401).json({
        success: false,
        message: "User not found",
      });
      return;
    }
    req.user = user;
    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: "Invalid token",
    });
    console.error(error);
    next(error);
  }
  // next();
});

export default protectRoute;
