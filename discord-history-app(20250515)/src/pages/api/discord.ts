import type { NextApiRequest, NextApiResponse } from 'next';
import { startDiscordBot } from '@/lib/discord';
import { Client, GatewayIntentBits } from 'discord.js';

// ✅ ここに記述する
export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
});

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    startDiscordBot();
    res.status(200).json({ message: 'Discord Bot起動しました' });
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
