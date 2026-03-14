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

        // Calcul des tâches urgentes (dans moins de 15 minutes)
        const maintenant = new Date();
        const dans15min = new Date(maintenant.getTime() + 15 * 60 * 1000);
        const tachesUrgentes = taches.filter(t =>
            !t.terminee &&
            t.date_execution &&
            new Date(t.date_execution) > maintenant &&
            new Date(t.date_execution) <= dans15min
        );

        // Données pour les push notifications
        const tachesPush = taches
            .filter(t => !t.terminee && t.date_execution)
            .map(t => ({
                id: t._id,
                titre: t.titre,
                date_execution: t.date_execution
            }));

        res.render('index', { 
            taches, 
            tachesUrgentes,
            tachesPush,
            recherche: recherche || '', 
            tri: tri || '', 
            username: req.session.username 
        });
    } catch (err) {
        res.status(500).send('Erreur serveur');
    }
});

// Ajouter une tâche
router.post('/ajout', authRequired, async (req, res) => {
    try {
        const { titre, description, date_execution } = req.body;
        const tache = new Tache({ 
            titre, 
            description,
            date_execution: date_execution ? new Date(date_execution) : null,
            user: req.session.userId 
        });
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