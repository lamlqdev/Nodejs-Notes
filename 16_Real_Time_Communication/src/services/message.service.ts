import { prisma } from '../prisma/client';
import type { MessageData } from '../types/index';

export interface SaveMessageData {
  roomId: string;
  username: string;
  content: string;
}

export async function saveMessage(data: SaveMessageData): Promise<MessageData> {
  const message = await prisma.message.create({
    data: {
      roomId: data.roomId,
      username: data.username,
      content: data.content,
    },
  });
  return message;
}

export async function getRecentMessages(roomId: string, limit = 50): Promise<MessageData[]> {
  const messages = await prisma.message.findMany({
    where: { roomId },
    orderBy: { createdAt: 'asc' },
    take: limit,
  });
  return messages;
}
