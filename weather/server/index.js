require('dotenv').config();
console.log('OPENWEATHER_API_KEY loaded:', !!process.env.OPENWEATHER_API_KEY);
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const weatherRouter = require('./routes/weather');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Optional: connect to MongoDB (for search history)
if (process.env.MONGODB_URI) {
    mongoose
        .connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => console.log('MongoDB connected'))
        .catch((err) => console.error('MongoDB connection error', err));
}


let redisClient = null;
if (process.env.REDIS_URL) {
    try {
        const Redis = require('ioredis');
        redisClient = new Redis(process.env.REDIS_URL);

        redisClient.on('connect', () => console.log('Redis connected'));
        redisClient.on('error', (e) => console.warn('Redis error', e));
    } catch (e) {
        console.warn('ioredis initialization failed:', e.message);
    }
} else {
    console.log('REDIS_URL not set — caching disabled');
}


app.locals.redis = redisClient;

app.use('/api/weather', weatherRouter);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
