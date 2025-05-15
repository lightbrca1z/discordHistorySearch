import { Client, GatewayIntentBits } from 'discord.js';
import OpenAI from 'openai';
import { sendToClients } from './websocket';
import { mastraProcess } from './mastra';

export const startDiscordBot = () => {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (!message.guild) return; // ギルド限定

    if (message.content.startsWith('!smart')) {
      const query = message.content.slice('!smart'.length).trim();
      const messages = await message.channel.messages.fetch({ limit: 20 });
      const historyText = [...messages.values()]
        .reverse()
        .map((msg) => `${msg.author.username}: ${msg.content}`)
        .join('\n');

      const prompt = `
以下のDiscord履歴を分析し、ユーザーの「${query}」に対して適切な回答を生成してください。
履歴:
${historyText}
回答は自然な会話形式で、履歴の文脈を考慮して作成してください。
      `;

      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: 'あなたはDiscordの履歴分析アシスタントです。' },
            { role: 'user', content: prompt },
          ],
        });

        const aiReply = completion.choices[0].message.content || 'エラーが発生しました。';
        await message.channel.send(aiReply);

        // WebSocket送信
        sendToClients({
          type: 'ai_response',
          history: historyText,
          reply: aiReply,
        });

        // Mastraエージェント処理
        mastraProcess(query);
      } catch (error) {
        console.error(error);
        await message.channel.send('AIエラーが発生しました。');
      }
    }
  });

  client.once('ready', () => {
    console.log(`✅ Discord Bot Logged in as ${client.user?.tag}`);
  });

  client.login(process.env.DISCORD_TOKEN);
};
