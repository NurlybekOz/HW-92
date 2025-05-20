export interface UserFields {
    username: string;
    password: string;
    token: string;
}

export interface ChatMessage {
    username: string;
    text: string;
    datetime: string;
}

export interface Member {
    username: string;
}

export interface IncomingMessage {
    type: string;
    payload: ChatMessage;
}