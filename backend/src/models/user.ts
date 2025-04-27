import { Schema, model } from 'mongoose';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

interface IUser extends mongoose.Document {
  username: string;
  email: string;
  password: string;
  apiKey?: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
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
    offlineMode: {
      type: Boolean,
      default: false,
    },
    offlineResponses: [
      {
        type: Schema.Types.ObjectId,
        ref: 'OfflineResponse',
      },
    ],
    apiUsage: {
      count: {
        type: Number,
        default: 0,
      },
      lastReset: {
        type: Date,
        default: Date.now,
      },
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre(
  'save',
  async function (this: IUser, next: (err?: Error) => void) {
    if (!this.isModified('password')) return next();

    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
    } catch (error) {
      return next(error as Error);
    }
  }
);

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<IUser>('User', userSchema);
export default User;
