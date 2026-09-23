import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middleware/error-handler';
import { mountApiDocs } from './docs/swagger';
import './database/models';

import authRoutes from './modules/auth/auth.routes';
import clinicRoutes from './modules/clinics/clinic.routes';
import userRoutes from './modules/users/user.routes';
import { adminRouter as adminDoctorRoutes, publicRouter as doctorRoutes } from './modules/doctors/doctor.routes';
import exceptionRoutes from './modules/scheduling/scheduling.routes';
import appointmentRoutes from './modules/appointments/appointment.routes';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:'],
        },
      },
    })
  );
  app.use(cors());
  app.use(express.json());

  mountApiDocs(app);

  app.get('/health', (_req, res) => {
    res.json({
      success: true,
      message: 'API is healthy',
    });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/admin/clinic', clinicRoutes);
  app.use('/api/admin/users', userRoutes);
  app.use('/api/admin/doctors', adminDoctorRoutes);
  app.use('/api/admin/exceptions', exceptionRoutes);
  app.use('/api/doctors', doctorRoutes);
  app.use('/api/appointments', appointmentRoutes);

  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: `Route ${req.method} ${req.path} not found`,
      code: 'NOT_FOUND',
    });
  });

  app.use(errorHandler);
  return app;
}
