import { LearningContext } from './types';

interface MastraResponse {
  response: string;
  context: {
    emotion: string;
    confidence: number;
    relatedTopics: string[];
  };
}

// Mastraエージェントのコンテキストを取得
export const getMastraContext = async (userId: string): Promise<string> => {
  try {
    // TODO: Mastraサーバーからコンテキストを取得する実装
    const response = await fetch(`${process.env.MASTRA_SERVER_URL}/context/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MASTRA_API_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Mastra context');
    }

    const data = await response.json();
    return data.context;
  } catch (error) {
    console.error('Mastra context fetch error:', error);
    return '';
  }
};

// Mastraエージェントへの処理の委譲
export const mastraProcess = async (query: string, context: LearningContext[]): Promise<MastraResponse> => {
  try {
    // Mastraサーバーへのリクエスト実装
    const response = await fetch(`${process.env.MASTRA_SERVER_URL}/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MASTRA_API_KEY}`
      },
      body: JSON.stringify({
        query,
        context: context.map(ctx => ({
          content: ctx.content,
          timestamp: ctx.timestamp,
          category: ctx.category,
          tags: ctx.tags
        })),
        conversationStyle: {
          tone: 'friendly',
          formality: 'casual',
          personality: 'helpful'
        }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to process with Mastra');
    }

    const data = await response.json();
    return {
      response: data.response,
      context: {
        emotion: data.emotion || 'neutral',
        confidence: data.confidence || 0.8,
        relatedTopics: data.relatedTopics || []
      }
    };
  } catch (error) {
    console.error('Mastra process error:', error);
    return {
      response: '申し訳ありません。現在Mastraサーバーとの通信に問題が発生しています。',
      context: {
        emotion: 'neutral',
        confidence: 0,
        relatedTopics: []
      }
    };
  }
};
  