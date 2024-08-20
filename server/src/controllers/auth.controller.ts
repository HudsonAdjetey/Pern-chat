import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import prisma from "../db/prisma";

const login = asyncHandler(async (req: Request, res: Response, next) => {
  try {
    // const { username, password } = req.body;
    // Your login logic here
    res.json({ success: true, message: "Login successful" });
  } catch (error) {}
});

const logout = asyncHandler(async (req: Request, res: Response, next) => {
  try {
    res.json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
    next(error);
  }
});

// type for req body

interface SignupRequest {
  username: string;
  password: string;
  email: string;
  confirmPassword: string;
  gender: string;
}

const signup = asyncHandler(async (req: Request, res: Response, next) => {
  try {
    // Ensure that req.body is typed appropriately
    const { username, password, email, confirmPassword, gender } =
      req.body as SignupRequest;

    // Check if the fields are not present
    if (!username || !password || !email || !confirmPassword || !gender) {
      res.status(400).json({
        success: false,
        message: "All fields are required",
      });
      return;
    }

    if (password !== confirmPassword) {
      res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
      return;
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (user) {
      res.status(400).json({
        success: false,
        message: "Username already taken",
      });
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
    next(error);
  }
});

const controllers = {
  login,

  logout,
  signup,
};

export default controllers;
