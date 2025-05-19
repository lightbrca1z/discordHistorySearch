import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './WeatherForecast.css';

// OpenWeatherMapのAPIキーを設定
const API_KEY = 'a6d5af9066aa0431cc6915306e306321'; // ここに実際のAPIキーを入力してください
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

interface WeatherData {
  name: string;
  main: {
    temp: number;
    humidity: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
}

const WeatherForecast: React.FC = () => {
  const [city, setCity] = useState<string>('Tokyo');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const fetchWeather = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${BASE_URL}?q=${city}&appid=${API_KEY}&units=metric`);
      setWeather(response.data);
    } catch (err) {
      setError('天気情報の取得に失敗しました。');
      console.error('Error fetching weather:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWeather();
  };

  return (
    <div className="weather-container">
      <h1>天気予報</h1>
      <form onSubmit={handleSubmit} className="search-form">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="都市名を入力"
          className="city-input"
        />
        <button type="submit" className="search-button">
          検索
        </button>
      </form>

      {loading && <p>読み込み中...</p>}
      {error && <p className="error">{error}</p>}

      {weather && (
        <div className="weather-info">
          <h2>{weather.name}</h2>
          <div className="weather-details">
            <div className="temperature">
              <h3>気温</h3>
              <p>{Math.round(weather.main.temp)}°C</p>
            </div>
            <div className="weather-description">
              <h3>天気</h3>
              <p>{weather.weather[0].description}</p>
              <img
                src={`http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                alt={weather.weather[0].description}
              />
            </div>
            <div className="humidity">
              <h3>湿度</h3>
              <p>{weather.main.humidity}%</p>
            </div>
            <div className="wind">
              <h3>風速</h3>
              <p>{weather.wind.speed} m/s</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherForecast; 