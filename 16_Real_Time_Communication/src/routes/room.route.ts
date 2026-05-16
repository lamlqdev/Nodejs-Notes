import { Router } from 'express';
import {
  createRoomController,
  listRoomsController,
  getMessageHistoryController,
} from '../controllers/room.controller';
import { sseController } from '../controllers/sse.controller';
import { validate } from '../middlewares/validation.middleware';
import {
  createRoomSchema,
  roomParamsSchema,
  sseParamsSchema,
} from '../validations/room.validation';

const router = Router();

router.get('/', listRoomsController);
router.post('/', validate(createRoomSchema), createRoomController);
router.get('/:id/messages', validate(roomParamsSchema), getMessageHistoryController);
router.get('/:id/sse', validate(sseParamsSchema), sseController);

export default router;
