// server/routes/weather.js
const express = require('express');
const axios = require('axios');
const router = express.Router();
const Search = require('../models/Search'); // optional - can keep or remove if you don't want DB history


const OPENWEATHER_KEY = process.env.OPENWEATHER_API_KEY;
if (!OPENWEATHER_KEY) console.warn('OPENWEATHER_API_KEY not set in .env');

// helper to geocode city -> lat/lon
async function geocodeCity(city) {
  const url = `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${OPENWEATHER_KEY}`;
  const res = await axios.get(url);
  if (!res.data || res.data.length === 0) throw new Error('Location not found');
  const { lat, lon, name, country } = res.data[0];
  return { lat, lon, name, country };
}

// cache key generator
function cacheKey(lat, lon, units = 'metric') {
  return `weather:${lat.toFixed(4)}:${lon.toFixed(4)}:${units}`;
}

// GET /api/weather?city=CityName&units=metric
router.get('/', async (req, res) => {
  const city = req.query.city;
  const units = req.query.units || 'metric';
  if (!city) return res.status(400).json({ error: 'city query param required' });

  try {
    const { lat, lon, name, country } = await geocodeCity(city);

    // Save search history (optional) — do not block request on DB
    if (process.env.MONGODB_URI) {
      Search.create({ city: name + ', ' + country, lat, lon }).catch((e) =>
        console.warn('save search failed', e.message)
      );
    }

    const redis = req.app.locals.redis;
    const key = cacheKey(lat, lon, units);

    // Try cache (if redis configured)
    if (redis) {
      try {
        const cached = await redis.get(key);
        if (cached) {
          // parse and send cached JSON
          return res.json(JSON.parse(cached));
        }
      } catch (e) {
        console.warn('Redis get failed', e.message);
        // continue to fetch fresh data
      }
    }

    // Fetch from OpenWeather One Call 3.0
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${OPENWEATHER_KEY}`;
    const owResp = await axios.get(weatherUrl);
    

    const payload = { location: { name, country, lat, lon }, data: owResp.data };

    // Store in Redis with TTL
    if (redis) {
      try {
        const ttl = parseInt(process.env.WEATHER_CACHE_TTL || '600', 10);
        await redis.set(key, JSON.stringify(payload), 'EX', ttl);
      } catch (e) {
        console.warn('Redis set failed', e.message);
      }
    }

    return res.json(payload);
  } catch (err) {
    console.error('Weather route error:', err.message);
    return res.status(500).json({ error: err.message || 'server error' });
  }
});

module.exports = router;
