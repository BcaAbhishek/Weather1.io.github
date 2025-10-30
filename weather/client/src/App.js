import React, { useState } from "react";
import "./App.css";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");

  const fetchWeather = async () => {
    setError("");
    setWeather(null);
    try {
      const res = await fetch(`http://localhost:5000/api/weather?city=${city}`);
      const data = await res.json();
      if (data.error) {
        setError("City not found or server error");
      } else {
        setWeather(data);
      }
    } catch {
      setError("Server not reachable");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (city.trim() === "") {
      setError("Please enter a city");
      return;
    }
    fetchWeather();
  };

  // Decide background video based on weather condition
  const getBackgroundVideo = () => {
    if (!weather) return "videos/sunny.mp4";
    const condition = weather.data.weather[0].main.toLowerCase();
    if (condition.includes("rain")) return "videos/rain.mp4";
    if (condition.includes("cloud")) return "videos/clouds.mp4";
    if (condition.includes("thunder")) return "videos/storm.mp4";
    return "videos/sunny.mp4";
  };

  // Decide weather emoji/icon
  const getWeatherIcon = () => {
    if (!weather) return "🌤️";
    const condition = weather.data.weather[0].main.toLowerCase();
    if (condition.includes("rain")) return "🌧️";
    if (condition.includes("cloud")) return "☁️";
    if (condition.includes("thunder")) return "🌩️";
    if (condition.includes("clear")) return "☀️";
    return "🌈";
  };

  return (
    <div className="app">
      {/* Background video */}
      <video autoPlay loop muted key={getBackgroundVideo()} className="bg-video">
        <source src={getBackgroundVideo()} type="video/mp4" />
      </video>

      <div className="container">
        <h1 className="title">🌦️ Weather Forecast</h1>
        <form onSubmit={handleSubmit} className="form">
          <input
            type="text"
            placeholder="Enter city name..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>

        {error && <p className="error">{error}</p>}

        {weather && (
          <div className="card fade-in">
            <h2>
              {getWeatherIcon()} {weather.location.name}, {weather.location.country}
            </h2>
            <div className="temp">{Math.round(weather.data.main.temp)}°C</div>
            <p className="desc">{weather.data.weather[0].description}</p>
            <div className="details">
              <p>💧 Humidity: {weather.data.main.humidity}%</p>
              <p>🌬️ Wind: {weather.data.wind.speed} m/s</p>
              <p>📊 Pressure: {weather.data.main.pressure} hPa</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
