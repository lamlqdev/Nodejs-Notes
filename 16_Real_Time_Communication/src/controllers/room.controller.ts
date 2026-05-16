import type { Request, Response, NextFunction } from 'express';
import { createRoom, listRooms } from '../services/room.service';
import { getRecentMessages } from '../services/message.service';
import { AppError } from '../middlewares/error.middleware';
import { prisma } from '../prisma/client';

export async function createRoomController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const room = await createRoom(req.body.name as string);
    res.status(201).json({ success: true, message: 'Room created successfully', data: room });
  } catch (err) {
    next(err);
  }
}

export async function listRoomsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const rooms = await listRooms();
    res.status(200).json({ success: true, message: 'Rooms retrieved successfully', data: rooms });
  } catch (err) {
    next(err);
  }
}

export async function getMessageHistoryController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const roomId = req.params.id as string;
    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) throw new AppError('Room not found', 404);

    const messages = await getRecentMessages(roomId, 50);
    res.status(200).json({
      success: true,
      message: 'Message history retrieved successfully',
      data: messages,
    });
  } catch (err) {
    next(err);
  }
}
