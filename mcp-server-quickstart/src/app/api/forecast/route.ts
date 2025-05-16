import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { latitude, longitude } = await request.json();

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return NextResponse.json(
        { error: '緯度と経度は数値で指定してください' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      throw new Error('OpenWeather API key is not set');
    }

    // APIリクエストのURLを構築
    const url = new URL('https://api.openweathermap.org/data/2.5/weather');
    url.searchParams.append('lat', latitude.toString());
    url.searchParams.append('lon', longitude.toString());
    url.searchParams.append('appid', apiKey);
    url.searchParams.append('units', 'metric');
    url.searchParams.append('lang', 'ja');

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Weather API Error:', errorData);
      throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    const forecastText = `${data.name}の天気予報:
気温: ${data.main.temp}°C
天気: ${data.weather[0].description}
湿度: ${data.main.humidity}%
風速: ${data.wind.speed}m/s`;

    return NextResponse.json({
      forecast: forecastText,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: '天気予報の取得に失敗しました: ' + (error instanceof Error ? error.message : '不明なエラー') },
      { status: 500 }
    );
  }
} 