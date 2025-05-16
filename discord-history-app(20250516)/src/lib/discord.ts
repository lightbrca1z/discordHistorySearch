import { Client, GatewayIntentBits } from 'discord.js';
import OpenAI from 'openai';
import { sendToClients } from './websocket';
import { mastraProcess, getMastraContext } from './mastra';
import { LearningContext } from './types';

// コンテキストストア
const contextStore: Map<string, LearningContext[]> = new Map();

// 会話スタイルの設定
const conversationStyles = {
  friendly: {
    greeting: ['こんにちは！', 'やあ！', 'お疲れ様です！'],
    thinking: ['うーん...', '考えてみましょう...', 'そうですね...'],
    error: ['ごめんね、ちょっとうまくいかなかったみたい...', '申し訳ない、エラーが発生しちゃった...']
  }
};

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
    if (!message.guild) return;

    // 独学日記の記録
    if (message.content.startsWith('!learn')) {
      const content = message.content.slice('!learn'.length).trim();
      const userId = message.author.id;
      
      const newContext: LearningContext = {
        timestamp: Date.now(),
        content,
        category: 'learning',
        tags: [],
      };

      if (!contextStore.has(userId)) {
        contextStore.set(userId, []);
      }
      contextStore.get(userId)?.push(newContext);

      const greeting = conversationStyles.friendly.greeting[Math.floor(Math.random() * conversationStyles.friendly.greeting.length)];
      await message.channel.send(`${greeting} 独学の記録を保存しました！頑張ってますね！`);
      return;
    }

    // AIアシスタント機能
    if (message.content.startsWith('!smart')) {
      const query = message.content.slice('!smart'.length).trim();
      const userId = message.author.id;
      
      // ユーザーの学習コンテキストを取得
      const userContext = contextStore.get(userId) || [];
      const mastraContext = await getMastraContext(userId);
      
      const messages = await message.channel.messages.fetch({ limit: 20 });
      const historyText = [...messages.values()]
        .reverse()
        .map((msg) => `${msg.author.username}: ${msg.content}`)
        .join('\n');

      // 思考中のメッセージを送信
      const thinking = conversationStyles.friendly.thinking[Math.floor(Math.random() * conversationStyles.friendly.thinking.length)];
      const thinkingMessage = await message.channel.send(thinking);

      const prompt = `
以下の情報を基に、ユーザーの「${query}」に対して適切な回答を生成してください。

1. Discord履歴:
${historyText}

2. 学習コンテキスト:
${userContext.map(ctx => `- ${ctx.content} (${new Date(ctx.timestamp).toLocaleString()})`).join('\n')}

3. Mastraエージェントのコンテキスト:
${mastraContext}

回答は以下の点に注意して作成してください：
- 自然な会話形式で、親しみやすい口調を使用
- ユーザーの学習進捗を考慮した励ましの言葉を含める
- 関連する学習トピックへの言及を入れる
- 必要に応じて、具体的な例や参考資料を提案する
      `;

      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: 'あなたは親しみやすく、励ましの言葉を交えながら学習をサポートするアシスタントです。ユーザーの学習履歴とコンテキストを考慮して、適切なアドバイスや回答を提供します。' },
            { role: 'user', content: prompt },
          ],
        });

        const aiReply = completion.choices[0].message.content || 'エラーが発生しました。';
        
        // 思考中のメッセージを削除
        await thinkingMessage.delete();
        
        // Mastraエージェントの処理
        const mastraResponse = await mastraProcess(query, userContext);
        
        // 回答を送信
        await message.channel.send(aiReply);
        
        // 関連トピックがある場合は追加で送信
        if (mastraResponse.context.relatedTopics.length > 0) {
          const relatedTopics = mastraResponse.context.relatedTopics
            .map(topic => `- ${topic}`)
            .join('\n');
          await message.channel.send(`関連するトピック：\n${relatedTopics}`);
        }

        // WebSocket送信
        sendToClients({
          type: 'ai_response',
          history: historyText,
          reply: aiReply,
          context: userContext,
          mastraContext: mastraResponse.context
        });
      } catch (error) {
        console.error(error);
        const errorMessage = conversationStyles.friendly.error[Math.floor(Math.random() * conversationStyles.friendly.error.length)];
        await message.channel.send(errorMessage);
      }
    }
  });

  client.once('ready', () => {
    console.log(`✅ Discord Bot Logged in as ${client.user?.tag}`);
  });

  client.login(process.env.DISCORD_TOKEN);
};
