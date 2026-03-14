const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

const authRequired = (req, res, next) => {
    if (!req.session.userId) return res.redirect('/auth/login');
    next();
};

router.get('/', authRequired, async (req, res) => {
    try {
        const messages = await Message.find().sort({ dateCreation: 1 }).limit(50);
        res.render('chat', { messages, username: req.session.username });
    } catch (err) {
        res.status(500).send('Erreur serveur');
    }
});

module.exports = router;