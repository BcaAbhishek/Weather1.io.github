const mongoose = require('mongoose');


const SearchSchema = new mongoose.Schema({
city: { type: String, required: true },
lat: Number,
lon: Number,
createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.models.Search || mongoose.model('Search', SearchSchema);