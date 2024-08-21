import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import prisma from "../db/prisma";
import bcrypt, { genSalt } from "bcryptjs";
import jwt from "jsonwebtoken";
import generateToken from "../utils/generateToken";

const login = asyncHandler(async (req: Request, res: Response, next) => {
  try {
    const { username, password } = req.body as {
      username: string;
      password: string;
    };
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      res.status(401).json({ success: false, message: "User not found" });
      return;
    }
    // compare password against hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: "Invalid credentials" });
      return;
    }
    // generate JWT
    const token = generateToken(user.id, res);
    console.log(token);
    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        profilePic: user.profilePic,
      },
    } as {
      success: boolean;
      message: string;
      user: {
        id: string;
        username: string;
        profilePic: string | null;
      };
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
    next(error);
  }
});

const logout = asyncHandler(async (req: Request, res: Response, next) => {
  try {
    // clear all
    res.clearCookie("access");
    // clear cookie of access

    res.status(200).json({
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

enum Gender {
  MALE = "MALE",
  female = "FEMALE",
  other = "OTHER",
}

const signup = asyncHandler(async (req: Request, res: Response, next) => {
  try {
    const genderEnumValue: Gender =
      Gender[req.body.gender.toUpperCase() as keyof typeof Gender];
    const { username, password, confirmPassword, gender, fullName } =
      req.body as {
        username: string;
        password: string;
        confirmPassword: string;
        gender: typeof genderEnumValue;
        fullName: string;
      };
    // Check if the fields are not present
    if (!username || !password || !confirmPassword || !gender) {
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
    const genSalt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, genSalt);

    const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${username}`;
    const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${username}`;

    const newUser = await prisma.user.create({
      data: {
        username,
        gender,
        password: hashedPassword,
        fullName,
        profilePic: gender === Gender.MALE ? boyProfilePic : girlProfilePic,
      },
    });

    if (newUser) {
      // generate token
      generateToken(newUser.id, res);

      res.json({
        success: true,
        message: "Signup successful",
        user: {
          id: newUser.id,
          username: newUser.username,
          profilePic: newUser.profilePic,
        },
      });
    } else {
      res.status(400).json({ success: false, message: "Signup failed" });
      return;
    }
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
    next(error);
  }
});

const getMe = asyncHandler(async (req: Request, res: Response, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        profilePic: user.profilePic,
        fullName: user.fullName,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
    console.error(error);
    next(error);
  }
});

const controllers = {
  login,
  getMe,
  logout,
  signup,
};

export default controllers;
