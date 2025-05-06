import { Schema, model } from 'mongoose';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const ENCRYPTION_KEY =
  process.env.API_KEY_ENCRYPTION_KEY ||
  'defaultEncryptionKey12345678901234567890';
const IV_LENGTH = 16;

interface IUser extends mongoose.Document {
  username: string;
  email: string;
  password: string;
  apiKey?: string;
  chats: mongoose.Types.ObjectId[];
  offlineMode?: boolean;
  offlineResponses?: mongoose.Types.ObjectId[];
  apiUsage?: {
    count: number;
    lastReset: Date;
  };
  comparePassword(candidatePassword: string): Promise<boolean>;
  getDecryptedApiKey(): string | null;
  createdAt: Date;
  updatedAt: Date;
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

function looksEncrypted(text: string): boolean {
  if (!text) return false;

  const parts = text.split(':');
  return (
    parts.length === 2 &&
    /^[0-9a-f]{32}$/i.test(parts[0]) &&
    /^[0-9a-f]+$/i.test(parts[1])
  );
}

function encryptApiKey(text: string): string {
  if (!text) return '';

  if (looksEncrypted(text)) {
    return text;
  }

  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32));
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Błąd podczas szyfrowania klucza API:', error);
    return text;
  }
}

function decryptApiKey(text: string): string {
  if (!text) {
    return '';
  }

  if (!looksEncrypted(text)) {
    return text;
  }

  try {
    const textParts = text.split(':');
    if (textParts.length !== 2) {
      return text;
    }

    const iv = Buffer.from(textParts[0], 'hex');
    const encryptedText = textParts[1];
    const key = Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32));

    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Błąd podczas deszyfrowania klucza API:', error);
    return '';
  }
}

userSchema.pre(
  'save',
  async function (this: IUser, next: (err?: Error) => void) {
    if (this.isModified('password')) {
      try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
      } catch (error) {
        return next(error as Error);
      }
    }

    if (this.isModified('apiKey') && this.apiKey) {
      try {
        const originalKey = this.apiKey;
        this.apiKey = encryptApiKey(originalKey);
      } catch (error) {
        console.error('Błąd podczas szyfrowania klucza API:', error);
        return next(error as Error);
      }
    }

    next();
  }
);

userSchema.methods.getDecryptedApiKey = function (): string | null {
  if (!this.apiKey) return null;

  const decrypted = decryptApiKey(this.apiKey);
  return decrypted || null;
};

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate() as mongoose.UpdateQuery<IUser>;

  if (update && '$set' in update && update.$set && update.$set.apiKey) {
    update.$set.apiKey = encryptApiKey(update.$set.apiKey);
  } else if (update && 'apiKey' in update) {
    update.apiKey = encryptApiKey(update.apiKey);
  }

  next();
});

const User = mongoose.model<IUser>('User', userSchema);
export default User;
