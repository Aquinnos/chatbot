import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  apiKey: {
    type: String,
    required: false,
  },
  chats: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Chat',
    },
  ],
});
const User = model('User', userSchema);
export default User;
