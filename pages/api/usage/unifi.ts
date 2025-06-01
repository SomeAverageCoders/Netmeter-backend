import type { NextApiRequest, NextApiResponse } from 'next';
import { getClientData } from '@/lib/unifiService';
import type { UnifiClient } from '@/types/unifi'; // adjust path as needed

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const clients: UnifiClient[] = await getClientData();

    const formatted = clients.map((client) => ({
      deviceId: client.mac,
      ip: client.ip,
      hostname: client.hostname || 'Unknown',
      dataUsedMB: (client.tx_bytes + client.rx_bytes) / (1024 * 1024), // Fix parentheses
      lastSeen: client.last_seen,
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (error: any) {
    console.error("❌ API Handler Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}