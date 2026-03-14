const express = require('express');
const router = express.Router();
const Tache = require('../models/Tache');

// Middleware pour vérifier si connecté
const authRequired = (req, res, next) => {
    if (!req.session.userId) return res.redirect('/auth/login');
    next();
};

// Afficher les tâches
router.get('/', authRequired, async (req, res) => {
    try {
        const { recherche, tri } = req.query;
        let query = { user: req.session.userId };
        if (recherche) query.titre = { $regex: recherche, $options: 'i' };
        
        let taches = await Tache.find(query);
        
        if (tri === 'date') taches.sort((a, b) => b.dateCreation - a.dateCreation);
        if (tri === 'titre') taches.sort((a, b) => a.titre.localeCompare(b.titre));
        if (tri === 'statut') taches.sort((a, b) => a.terminee - b.terminee);

        res.render('index', { taches, recherche: recherche || '', tri: tri || '', username: req.session.username });
    } catch (err) {
        res.status(500).send('Erreur serveur');
    }
});

// Ajouter une tâche
router.post('/ajout', authRequired, async (req, res) => {
    try {
        const { titre, description } = req.body;
        const tache = new Tache({ titre, description, user: req.session.userId });
        await tache.save();
        res.redirect('/taches');
    } catch (err) {
        res.status(500).send('Erreur serveur');
    }
});

// Marquer comme terminée
router.post('/terminer/:id', authRequired, async (req, res) => {
    try {
        const tache = await Tache.findById(req.params.id);
        tache.terminee = !tache.terminee;
        await tache.save();
        res.redirect('/taches');
    } catch (err) {
        res.status(500).send('Erreur serveur');
    }
});

// Modifier le titre
router.post('/modifier/:id', authRequired, async (req, res) => {
    try {
        await Tache.findByIdAndUpdate(req.params.id, { titre: req.body.titre });
        res.redirect('/taches');
    } catch (err) {
        res.status(500).send('Erreur serveur');
    }
});

// Supprimer une tâche
router.post('/supprimer/:id', authRequired, async (req, res) => {
    try {
        await Tache.findByIdAndDelete(req.params.id);
        res.redirect('/taches');
    } catch (err) {
        res.status(500).send('Erreur serveur');
    }
});

module.exports = router;