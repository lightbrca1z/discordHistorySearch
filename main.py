import os
import discord
import openai
import traceback
from dotenv import load_dotenv

# .env読み込み
load_dotenv()

# 環境変数取得
DISCORD_TOKEN = os.getenv("DISCORD_TOKEN")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not DISCORD_TOKEN or not OPENAI_API_KEY:
    print("環境変数 DISCORD_TOKEN または OPENAI_API_KEY が設定されていません。")
    exit(1)

# OpenAIクライアント初期化（v1.0.0以降の新しい書き方）
client = openai.OpenAI(api_key=OPENAI_API_KEY)

# Intents設定
intents = discord.Intents.default()
intents.message_content = True

# Discordクライアント
discord_client = discord.Client(intents=intents)

@discord_client.event
async def on_message(message):
    if message.author == discord_client.user:
        return

    if message.content.startswith('!smart'):
        query = message.content[len('!smart'):].strip()

        # チャンネル履歴取得
        history = []
        async for msg in message.channel.history(limit=20):
            history.append(f"{msg.author.name}: {msg.content}")

        history_text = "\n".join(history)

        prompt = f"""
以下のDiscord履歴を分析し、ユーザーの「{query}」に対して適切な回答を生成してください。

履歴:
{history_text}

回答は自然な会話形式で、履歴の文脈を考慮して作成してください。
"""

        try:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "あなたはDiscordの会話履歴を分析し、適切な回答を生成するアシスタントです。"},
                    {"role": "user", "content": prompt}
                ]
            )
            await message.channel.send(response.choices[0].message.content)
        except Exception as e:
            await message.channel.send(f"エラーが発生しました: {e}")
            traceback.print_exc()

# 実行
discord_client.run(DISCORD_TOKEN)
