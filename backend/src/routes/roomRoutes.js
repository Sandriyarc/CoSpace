import { Router } from 'express';
import * as roomController from '../controllers/roomController.js';

const router = Router();

// Endpoint CRUD Ruangan
router.get('/', roomController.getAllRooms);
router.get('/:id', roomController.getRoomById);
router.get('/:id/bookings', roomController.getRoomBookings);
router.post('/', roomController.createRoom);
router.put('/:id', roomController.updateRoom);
router.delete('/:id', roomController.deleteRoom);

export default router;

