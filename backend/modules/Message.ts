import mongoose from "mongoose";

const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    username: {
        type: String,
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    datetime: {
        type: Date,
        required: true,
    }
})


const Message = mongoose.model('Message', MessageSchema);
export default Message;