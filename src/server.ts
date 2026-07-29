import express from 'express';
import authRoutes from './routes/authRoutes';
import { authenticate } from './middleware/authenticate';
import { authorize } from './middleware/authorize';

const app = express();

app.use(express.json());
app.use('/auth', authRoutes);

app.get('/doctors-only', authenticate, authorize(['doctor']), (req, res) => {
  return res.status(200).json({ message: 'Doctor-only content' });
});

app.get('/patients-and-doctors', authenticate, authorize(['patient', 'doctor']), (req, res) => {
  return res.status(200).json({ message: 'Patient and doctor access granted' });
});

app.get('/investigators-only', authenticate, authorize(['trial_investigator']), (req, res) => {
  return res.status(200).json({ message: 'Trial investigator dashboard access' });
});

export default app;
