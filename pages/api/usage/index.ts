import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import Usage from '@/models/Usage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method === 'POST') {
    try {

      await connectDB(); // Connect to MongoDB
      const data = req.body;

    // Convert the structure from { "2025-06-08": {...} } to a flat object with "date"
      const [date] = Object.keys(data);
      const usageData = {
        date,
        ...data[date],
      };

      await Usage.create(usageData);

      return res.status(200).json({ message: 'Usage data inserted successfully' });
    } catch (error) {
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  } else if (req.method === 'GET') {
    try {
      const usageRecords = await Usage.find({});
      res.status(200).json({ success: true, usageRecords });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
