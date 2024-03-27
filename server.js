import express from 'express';
import { createServer } from 'http';
import socketIO from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const server = createServer(app);
const io = socketIO(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
    },
});

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('message', (message) => {
        console.log('Received message:', message);
        socket.broadcast.emit('message', message);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const port = 8080;
server.listen(port, () => {
    console.log(`Socket.IO server running on port ${port}`);
});