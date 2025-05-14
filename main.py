import sys
sys.path.append("C:\Users\User\Desktop\PracticeUdemyReact2\discordHistorySearch\mastra_ai")]

  # mastraを置いた場所
import discord
from agent.agenthub import AgentHub
from agent.openai_agent import OpenAIAgent
# Discord Bot トークン
import os
from dotenv import load_dotenv

# .envファイルを読み込む
load_dotenv()

# 環境変数を取得
DISCORD_TOKEN = os.getenv("DISCORD_TOKEN")

# OpenAI APIキー
OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY'

# Intents（メッセージ履歴取得に必要）
intents = discord.Intents.default()
intents.message_content = True

# Discordクライアント
client = discord.Client(intents=intents)

# Mastraエージェントハブ初期化（MCP有効）
hub = AgentHub(enable_mcp=True)

# エージェントを役割ごとに登録
search_agent = OpenAIAgent(api_key=OPENAI_API_KEY)
expert_agent = OpenAIAgent(api_key=OPENAI_API_KEY)

hub.register_agent("search_agent", search_agent, role="履歴分析担当")
hub.register_agent("expert_agent", expert_agent, role="会話生成担当")

# Discordメッセージイベント
@client.event
async def on_message(message):
    if message.author == client.user:
        return

    if message.content.startswith('!smart'):
        query = message.content[len('!smart'):].strip()

        # チャンネル履歴取得
        history = []
        async for msg in message.channel.history(limit=100):
            history.append(f"{msg.author.name}: {msg.content}")

        history_text = "\n".join(history)

        # MCPプロンプト作成
        prompt = f"""
あなたたちは、以下の役割を持ったエージェントです。
- 履歴分析担当: 履歴を解析し、重要な発言やパターンを見つける。
- 会話生成担当: 履歴分析をもとに、ユーザーの「{query}」に対してGPT風に自然な回答を作る。

以下がDiscord履歴です:
{history_text}

では、協力して最適な返答を作ってください。
"""

        # MCPモードで複合的に回答生成
        response = hub.ask_with_mcp(prompt)

        await message.channel.send(response)

client.run(DISCORD_TOKEN)
