import { Router } from 'express';
import { getHolidays, createHoliday, deleteHoliday, createHolidaySchema } from '../controllers/holidayController';
import { authenticate, authorizeRoles, SystemRole } from '../middlewares/auth';
import { validateBody } from '../middlewares/validation';

const router = Router();

router.use(authenticate);

router.get('/', getHolidays);

router.post(
  '/',
  authorizeRoles(SystemRole.SCHOOL_ADMIN),
  validateBody(createHolidaySchema),
  createHoliday
);

router.delete('/:id', authorizeRoles(SystemRole.SCHOOL_ADMIN), deleteHoliday);

export default router;
