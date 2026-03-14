const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Page login
router.get('/login', (req, res) => {
    res.render('login', { error: null });
});

// Page register
router.get('/register', (req, res) => {
    res.render('register', { error: null });
});

// Inscription
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const userExiste = await User.findOne({ username });
        if (userExiste) {
            return res.render('register', { error: 'Nom d\'utilisateur déjà pris' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword });
        await user.save();
        res.redirect('/auth/login');
    } catch (err) {
        res.render('register', { error: 'Erreur serveur' });
    }
});

// Connexion
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            return res.render('login', { error: 'Utilisateur introuvable' });
        }
        const valide = await bcrypt.compare(password, user.password);
        if (!valide) {
            return res.render('login', { error: 'Mot de passe incorrect' });
        }
        req.session.userId = user._id;
        req.session.username = user.username;
        res.redirect('/taches');
    } catch (err) {
        res.render('login', { error: 'Erreur serveur' });
    }
});

// Déconnexion
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/auth/login');
});

module.exports = router;