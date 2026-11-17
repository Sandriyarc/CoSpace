import { Router } from 'express';
import * as bookingController from '../controllers/bookingController.js';

const router = Router();

// Endpoint CRUD Booking / Reservasi
router.get('/', bookingController.getAllBookings);
router.get('/:id', bookingController.getBookingById);
router.post('/', bookingController.createBooking);
router.put('/:id', bookingController.updateBooking);
router.delete('/:id', bookingController.deleteBooking);

export default router;

