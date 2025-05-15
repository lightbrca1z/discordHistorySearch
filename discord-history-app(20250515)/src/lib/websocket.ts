import { WebSocketServer } from 'ws';

export const wss = new WebSocketServer({ port: 3001 });

export function sendToClients(data: any) {
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(data));
    }
  });
}

console.log('✅ WebSocket Server 起動しました (ws://localhost:3001)');
