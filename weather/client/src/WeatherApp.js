import React, { useState } from "react";
import axios from "axios";

function WeatherApp() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");

  const fetchWeather = async () => {
    try {
      setError("");
      const res = await axios.get(`http://localhost:5000/api/weather?city=${city}`);
      setWeather(res.data);
    } catch (err) {
      setError("City not found or server error");
      setWeather(null);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "40px" }}>
      <h1>🌦️ Weather Forecast</h1>
      <input
        type="text"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="Enter city name"
        style={{
          padding: "10px",
          width: "250px",
          borderRadius: "5px",
          border: "1px solid #ccc",
          marginRight: "10px",
        }}
      />
      <button
        onClick={fetchWeather}
        style={{
          padding: "10px 20px",
          borderRadius: "5px",
          border: "none",
          background: "#007bff",
          color: "white",
          cursor: "pointer",
        }}
      >
        Search
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {weather && (
        <div style={{ marginTop: "20px" }}>
          <h2>
            {weather.location.name}, {weather.location.country}
          </h2>
          <p>Temperature: {weather.data.main.temp}°C</p>
          <p>Condition: {weather.data.weather[0].description}</p>
          <p>Humidity: {weather.data.main.humidity}%</p>
          <p>Wind Speed: {weather.data.wind.speed} m/s</p>
        </div>
      )}
    </div>
  );
}

export default WeatherApp;
