const mongoose = require('mongoose');

const TacheSchema = new mongoose.Schema({
    titre: { type: String, required: true },
    description: { type: String },
    terminee: { type: Boolean, default: false },
    dateCreation: { type: Date, default: Date.now },
    date_execution: { type: Date, default: null },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('Tache', TacheSchema);