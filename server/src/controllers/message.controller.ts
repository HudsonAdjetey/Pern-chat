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
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server error" });
    next(error);
  }
});

const messageControllers = {
  sendMessage,
};

export default messageControllers;
