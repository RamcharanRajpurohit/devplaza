import app from './app';
import { Request, Response } from 'express';
import userInfoRoutes from './routes/userInfo';

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

// Add user info routes
app.use('/api/user/info', userInfoRoutes);