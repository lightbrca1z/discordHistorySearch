'use client';
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3001');
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'ai_response') {
        console.log('AIからの応答:', data.reply);
      }
    };
    return () => ws.close();
  }, []);

  const startBot = async () => {
    await fetch('/api/discord', { method: 'POST' });
    alert('Bot起動リクエストを送信しました');
  };

  return (
    <div>
      <h1>Discord Bot 管理画面</h1>
      <button onClick={startBot}>Bot起動</button>
    </div>
  );
}
