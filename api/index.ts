import { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../src/app';
import connectDB from '../src/config/database';

let isConnected = false;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (!isConnected) {
      await connectDB(); // your custom db logic using Prisma
      isConnected = true;
    }
    app(req, res); // assuming `app` is your express instance
  } catch (err) {
    console.error('Handler error:', err);
    res.status(500).json({ message: 'Server error', error: err });
  }
}
