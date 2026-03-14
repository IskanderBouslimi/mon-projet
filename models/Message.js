const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    contenu: { type: String, required: true },
    auteur: { type: String, required: true },
    dateCreation: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);