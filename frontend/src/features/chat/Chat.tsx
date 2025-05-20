
import {useEffect, useRef, useState} from "react";
import {ChatMessage, IncomingMessage, Member} from "../../types";
import {useAppSelector} from "../../app/hooks.ts";
import {selectUser} from "../users/usersSlice.ts";
import {Grid} from "@mui/material";

const Chat = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [activeMembers, setActiveMembers] = useState<Member[]>([])
    const [messageInput, setMessageInput] = useState('')
    const user = useAppSelector(selectUser);
    const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

    const ws = useRef<WebSocket | null>(null)


    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault()

        if (!ws.current) return;

        if (!user) return;

        if (!messageInput) return;

        ws.current.send(JSON.stringify({
            type: 'SEND_MESSAGE',
            payload: {
                username: user.username,
                text: messageInput,
                datetime: new Date().toISOString(),
            }
        }));

        setMessageInput('')

    }

    const reconnectWebSocket = () => {
        console.log('Attempting to reconnect...');
        ws.current = new WebSocket('ws://localhost:8000/ws/chat');

        ws.current.onopen = () => {
            if (user) {
                ws.current?.send(JSON.stringify({
                    type: 'LOGIN',
                    payload: user
                }));
            }
        };

        ws.current.onclose = () => {
            console.log('WebSocket closed');
            if (!reconnectTimeout.current) {
                reconnectTimeout.current = setTimeout(() => reconnectWebSocket(), 10000);
            }
        };

        ws.current.onmessage = event => {
            const decodedMessage = JSON.parse(event.data) as IncomingMessage;
            const type = decodedMessage.type;

            if (type === 'NEW_MESSAGE') {
                setMessages((prevState) => [...prevState, decodedMessage.payload]);
            } else if (type === 'INIT') {
                setMessages([...decodedMessage.payload.messages].reverse());
                setActiveMembers(decodedMessage.payload.users);
            } else if (type === 'NEW_USER') {
                setActiveMembers((prevState) => [decodedMessage.payload, ...prevState]);
            } else if (type === 'USER_LOGOUT') {
                setActiveMembers((prevState) =>
                    prevState.filter(user => user.username !== decodedMessage.payload.users.username)
                );

            }
        };
    };

    useEffect(() => {
        reconnectWebSocket();

        return () => {
            if (ws.current) {
                ws.current.close();
            }
            if (reconnectTimeout.current) {
                clearTimeout(reconnectTimeout.current);
            }
        };
    }, [user]);





    let chat = (
        <Grid container spacing={2}>
            <Grid size={2} sx={{border: '1px solid black', maxHeight: '500px', padding: '10px'}}>
                <h3 style={{margin: '0px', textAlign: 'center'}}>Online Users:</h3>
                <ul style={{listStyle: 'none', padding: '0px', margin: '0px'}}>
                    {activeMembers.map((member, index) => (
                        <li key={index}>
                            <b>{member?.username}</b>
                        </li>
                    ))}
                </ul>
            </Grid>
            <Grid size={6} sx={{border: '1px solid black', padding: '10px', height: '500px', position: 'relative'}}>
                <div style={{height: '450px', overflowY: 'scroll'}}>
                {messages.map((message, index) => (
                    <div key={index}>
                        <b>{message.username} : {message.text}</b>
                    </div>
                ))}
                </div>
                <form onSubmit={sendMessage} style={{width:'100%', position: 'absolute', bottom: '5px', display: 'flex', gap: '10px'}}>
                    <input
                        type="text"
                        name="messageText"
                        value={messageInput}
                        onChange={e => setMessageInput(e.target.value)}
                        style={{width: '70%', height: '30px', padding: '5px'}}
                    />
                    <button type='submit' style={{width: '80px'}}>Send</button>
                </form>
            </Grid>

        </Grid>
    )


    return (
        <>
            {user ? chat : null}
        </>
    )
};

export default Chat
