require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

// Connexion MongoDB
mongoose.connect(process.env.MONGO_URI, { family: 4 })
    .then(() => console.log('✅ MongoDB Atlas connecté'))
    .catch(err => console.log('❌ Erreur MongoDB:', err));

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/taches', require('./routes/taches'));
app.use('/chat', require('./routes/chat'));

app.get('/', (req, res) => {
    if (req.session.userId) return res.redirect('/taches');
    res.redirect('/auth/login');
});

// Socket.io - Chat en temps réel
io.on('connection', (socket) => {
    console.log('Un utilisateur connecté au chat');

    socket.on('message', async (data) => {
        const message = new Message({ contenu: data.contenu, auteur: data.auteur });
        await message.save();
        io.emit('message', { contenu: data.contenu, auteur: data.auteur });
    });

    socket.on('disconnect', () => {
        console.log('Un utilisateur déconnecté du chat');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Serveur sur http://localhost:${PORT}`));