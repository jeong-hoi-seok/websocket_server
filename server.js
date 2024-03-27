import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import UAParser from 'ua-parser-js';
import { randomBytes } from 'crypto';
import moment from 'moment';
import 'moment-timezone';

const parser = new UAParser();

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
    },
});

//접속 정보 hash map
const accessor = new Map();

io.on('connection', (socket) => {
    const time = moment().tz('Asia/Seoul').format();
    console.log('--웹 소켓 연결 성공--');
    //socket info
    const id = randomBytes(8).toString('hex');
    const userAgent = socket.handshake.headers['user-agent'];
    //userAgent set
    parser.setUA(userAgent);
    const resultAgent = parser.getResult();

    const json = {
        browser: resultAgent.browser.name,
        os: resultAgent.os.name,
        connectionTime: time,
    }

    accessor.set(id, json);

    io.emit('accessor', Array.from(accessor, ([id, json]) => ({ id, ...json })));

    socket.on('disconnect', () => {
        accessor.delete(id);
        io.emit('accessor', Array.from(accessor, ([id, json]) => ({ id, ...json })));
    });
});

const port = 8080;
server.listen(port, () => {
    console.log(`Socket.IO 서버 시작 포트 번호 - ${port}`);
});