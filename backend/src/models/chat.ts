import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface IChat extends Document {
  title: string;
  userId: mongoose.Types.ObjectId;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const chatSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      default: 'New Chat',
    },
    userId: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    messages: [messageSchema],
  },
  {
    timestamps: true,
  }
);

// Create a compound index on userId and createdAt for efficient querying
chatSchema.methods.updateTitleFromContent = function () {
  if (this.messages.length > 0 && this.title === 'New Chat') {
    const userMessage: IMessage | undefined = this.messages.find(
      (m: IMessage) => m.role === 'user'
    );
    if (userMessage) {
      this.title = userMessage.content.substring(0, 30);
      if (userMessage.content.length > 30) this.title += '...';
    }
  }
};

const Chat = mongoose.model<IChat>('Chat', chatSchema);
export default Chat;
