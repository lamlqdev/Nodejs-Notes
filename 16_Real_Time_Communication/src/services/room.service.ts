import { prisma } from '../prisma/client';
import { AppError } from '../middlewares/error.middleware';

export async function createRoom(name: string) {
  const existing = await prisma.room.findUnique({ where: { name } });
  if (existing) throw new AppError(`Room "${name}" already exists`, 409);

  return prisma.room.create({ data: { name } });
}

export async function listRooms() {
  return prisma.room.findMany({ orderBy: { createdAt: 'desc' } });
}

export async function getRoomById(id: string) {
  const room = await prisma.room.findUnique({ where: { id } });
  if (!room) throw new AppError('Room not found', 404);
  return room;
}
