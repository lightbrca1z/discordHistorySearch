import React from 'react';
import { createRoot } from 'react-dom/client';
import WeatherForecast from './mastra/components/WeatherForecast';
import './mastra/components/WeatherForecast.css';

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <WeatherForecast />
  </React.StrictMode>
); 