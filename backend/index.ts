import express from 'express';
import expressWs from 'express-ws';
import cors from 'cors';
import WebSocket from 'ws';
import {IncomingMessage, Member} from "./types";
import usersRouter from "./routers/users";
import mongoose from "mongoose";
import config from "./config";
import Message from './modules/Message';

const app = express();
const wsInstance = expressWs(app);

const port = 8000;
app.use(cors());
app.use(express.json());
app.use('/users', usersRouter);

const router = express.Router();
wsInstance.applyTo(router)

const connectedClient: WebSocket[] = [];
const users: Member[] = [];

router.ws('/chat', async (ws, _req) => {
    connectedClient.push(ws);

    const messages = await Message.find().sort({datetime: -1}).limit(30)
    ws.send(JSON.stringify({type: 'INIT', payload: {messages, users}}));

    ws.on('message', (message) => {
        try {
            const decodedMessage = JSON.parse(message.toString()) as IncomingMessage;
            if (decodedMessage.type === 'LOGIN') {
                const {username} = decodedMessage.payload as Member;
                const existingUser = users.find(user => user.username === username);
                if (existingUser) {
                    ws.send(JSON.stringify({ error: 'User is already in use.' }));
                    return null;
                } else {
                    users.push({username})
                }
                connectedClient.forEach((clientWS) => {
                    clientWS.send(JSON.stringify({
                        type: 'NEW_USER',
                        payload: {username},
                    }));
                })
            }
            if (decodedMessage.type === 'SEND_MESSAGE') {
                const newMessage = new Message(decodedMessage.payload);
                newMessage.save();
                connectedClient.forEach((clientWS) => {
                    clientWS.send(JSON.stringify({
                        type: 'NEW_MESSAGE',
                        payload: {username: newMessage.username, text: newMessage.text, datetime: newMessage.datetime,},
                    }));
                })
            }

        } catch (e) {
            console.log(e)
            ws.send(JSON.stringify({error: 'Invalid message'}));
        }

    })


    ws.on('close', () => {
        const index = connectedClient.indexOf(ws);
        if (index !== -1) {
            connectedClient.splice(index, 1);
            const disconnectedUser = users[index];
            if (disconnectedUser) {
                connectedClient.forEach((clientWS) => {
                    clientWS.send(JSON.stringify({
                        type: 'USER_LOGOUT',
                        payload: {username: disconnectedUser.username},
                    }));
                });
                const userIndex = users.findIndex(user => user.username === disconnectedUser.username);
                if (userIndex !== -1) {
                    users.splice(userIndex, 1);
                }
            }
        }
    });
});

app.use('/ws', router);

const run = async () => {
    try {
        await mongoose.connect(config.db);

        app.listen(port, () => {
            console.log(`Server started on http://localhost:${port}`);
        });
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
    }

    process.on('exit', () => {
        mongoose.disconnect();
    });
};

run().catch(console.error);