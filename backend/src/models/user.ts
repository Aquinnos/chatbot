import { Schema, model } from 'mongoose';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// Klucz i wektor inicjalizacyjny dla szyfrowania/deszyfrowania klucza API
// Uwaga: Dla produkcji te wartości powinny być przechowywane w bezpiecznym miejscu (np. zmiennych środowiskowych)
const ENCRYPTION_KEY =
  process.env.API_KEY_ENCRYPTION_KEY ||
  'defaultEncryptionKey12345678901234567890'; // Klucz powinien mieć 32 bajty (256 bitów)
const IV_LENGTH = 16; // Dla AES, IV powinien mieć 16 bajtów (128 bitów)

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

// Funkcja do sprawdzania, czy string wygląda jak zaszyfrowany klucz API
function looksEncrypted(text: string): boolean {
  if (!text) return false;

  // Szukamy wzorca: [HEX reprezetnacja IV]:[HEX reprezentacja zaszyfrowanych danych]
  // IV ma 16 bajtów, co daje 32 znaki w HEX
  const parts = text.split(':');
  return (
    parts.length === 2 &&
    /^[0-9a-f]{32}$/i.test(parts[0]) &&
    /^[0-9a-f]+$/i.test(parts[1])
  );
}

// Funkcja do szyfrowania klucza API
function encryptApiKey(text: string): string {
  if (!text) return '';

  // Nie szyfruj ponownie, jeśli klucz wygląda na już zaszyfrowany
  if (looksEncrypted(text)) {
    return text;
  }

  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32)); // Upewniamy się, że klucz ma dokładnie 32 bajty
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Błąd podczas szyfrowania klucza API:', error);
    return text; // W przypadku błędu zwracamy oryginalny tekst dla bezpieczeństwa
  }
}

// Funkcja do deszyfrowania klucza API
function decryptApiKey(text: string): string {
  if (!text) return '';

  // Jeśli to nie wygląda na zaszyfrowany tekst, zwróć go bez zmian
  if (!looksEncrypted(text)) {
    return text;
  }

  try {
    const textParts = text.split(':');
    if (textParts.length !== 2) return text;

    const iv = Buffer.from(textParts[0], 'hex');
    const encryptedText = textParts[1];
    const key = Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32)); // Upewniamy się, że klucz ma dokładnie 32 bajty

    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Błąd podczas deszyfrowania klucza API:', error);
    return ''; // W przypadku błędu zwracamy pusty string
  }
}

// Middleware do szyfrowania klucza API przed zapisem
userSchema.pre(
  'save',
  async function (this: IUser, next: (err?: Error) => void) {
    // Jeśli hasło zostało zmodyfikowane, zahaszuj je
    if (this.isModified('password')) {
      try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
      } catch (error) {
        return next(error as Error);
      }
    }

    // Jeśli klucz API został zmodyfikowany, zaszyfruj go
    if (this.isModified('apiKey') && this.apiKey) {
      try {
        console.log(
          `Szyfrowanie klucza API dla użytkownika ${this.username}...`
        );
        const originalKey = this.apiKey;
        this.apiKey = encryptApiKey(originalKey);
        console.log(
          `Klucz API ${originalKey.substring(0, 6)}*** został ${
            this.apiKey !== originalKey
              ? 'zaszyfrowany'
              : 'pozostawiony bez zmian'
          }`
        );
      } catch (error) {
        console.error('Błąd podczas szyfrowania klucza API:', error);
        return next(error as Error);
      }
    }

    next();
  }
);

// Metoda dla instancji do deszyfrowania klucza API
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

// Middleware do szyfrowania klucza API przy aktualizacji dokumentu
userSchema.pre('findOneAndUpdate', function (next) {
  // Poprawne typowanie dla mongoose
  const update = this.getUpdate() as mongoose.UpdateQuery<IUser>;

  if (update && '$set' in update && update.$set && update.$set.apiKey) {
    console.log('Szyfrowanie klucza API przed aktualizacją dokumentu...');
    update.$set.apiKey = encryptApiKey(update.$set.apiKey);
  } else if (update && 'apiKey' in update) {
    console.log('Szyfrowanie klucza API przed aktualizacją dokumentu...');
    update.apiKey = encryptApiKey(update.apiKey);
  }

  next();
});

const User = mongoose.model<IUser>('User', userSchema);
export default User;
