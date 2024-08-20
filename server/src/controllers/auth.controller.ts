import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import prisma from "../db/prisma";
import bcrypt, { genSalt } from "bcryptjs";
import jwt from "jsonwebtoken";
import generateToken from "../utils/generateToken";

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

enum Gender {
  MALE = "MALE",
  female = "FEMALE",
  other = "OTHER",
}

const signup = asyncHandler(async (req: Request, res: Response, next) => {
  try {
    const genderEnumValue: Gender =
      Gender[req.body.gender.toUpperCase() as keyof typeof Gender];
    const { username, password, email, confirmPassword, gender, fullName } =
      req.body as {
        username: string;
        password: string;
        email: string;
        confirmPassword: string;
        gender: typeof genderEnumValue;
        fullName: string;
      };
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

const controllers = {
  login,

  logout,
  signup,
};

export default controllers;
