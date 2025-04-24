const mongoose = require('mongoose');
const Schema =  mongoose.Schema;

const UrlSchema = new Schema({
    originalUrl:{
        type: String,
        required: true
    },
    shortUrl:{
        type: String,
        required: true,
        unique: true
    },
    clicks:{
        type: Number,
        default: 0
    },
    email:{
        type: String,
        required: true
    },
});

const UrlModel = mongoose.model('urls', UrlSchema);

module.exports = { UrlModel };