import asyncHandler from "express-async-handler";
import { Response, Request } from "express";

import prisma from "../db/prisma";

interface PrismaObj {
  id: string;
  senderId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  sender: {
    id: string;
    fullName: string;
    username: string;
    profilePic: string;
    isActive: boolean;
    lastSeen: Date;
  };
}

const sendMessage = asyncHandler(async (req: Request, res: Response, next) => {
  try {
    const { message } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user?.id;
    const sender = await prisma.user.findUnique({ where: { id: receiverId } });
    let conversation = await prisma.conversation.findFirst({
      where: {
        participantsIds: {
          hasEvery: [senderId, receiverId],
        },
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          //   participants: { connect: [{ id: senderId }, { id: receiverId }] },
          participantsIds: {
            set: [senderId, receiverId],
          },
        },
      });
    }
    const newMessage = await prisma.messages.create({
      data: {
        senderId,
        body: message,
        conversationId: conversation.id,
        content: "",
      },
    });

    if (newMessage) {
      conversation = await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          messages: {
            connect: {
              id: newMessage.id,
            },
          },
        },
      });
    }
    res.status(201).json(newMessage);
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server error" });
    next(error);
  }
});

// get messages

const getMessage = asyncHandler(async (req: Request, res: Response, next) => {
  try {
    const { id: userToChatId } = req.params;
    const senderId = req.user?.id;
    const conversation = await prisma.conversation.findFirst({
      where: {
        participantsIds: {
          hasEvery: [senderId, userToChatId],
        },
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          include: {
            sender: true,
          },
        },
      },
    });
    if (!conversation) {
      res.status(404).json({ success: false, message: [] });
      return;
    }
    res.status(200).json(conversation.messages);
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server error" });
    next(error);
  }
});

const messageControllers = {
  sendMessage,
  getMessage,
};

export default messageControllers;
