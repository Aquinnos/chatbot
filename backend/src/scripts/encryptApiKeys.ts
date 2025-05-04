import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/user';
import crypto from 'crypto';

dotenv.config();

const ENCRYPTION_KEY =
  process.env.API_KEY_ENCRYPTION_KEY ||
  'defaultEncryptionKey12345678901234567890';
const IV_LENGTH = 16;

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

const encryptAllApiKeys = async () => {
  try {
    console.log('Rozpoczynam szyfrowanie kluczy API...');

    const MONGO_URI =
      process.env.MONGO_URI || 'mongodb://localhost:27017/chatbot';
    console.log(`Łączenie z bazą danych: ${MONGO_URI}...`);
    await mongoose.connect(MONGO_URI);
    console.log('Połączono z MongoDB');

    const users = await User.find({
      apiKey: {
        $exists: true,
        $ne: null,
        $nin: [''],
      },
    });

    console.log(`Znaleziono ${users.length} użytkowników z kluczami API.`);

    let encryptedCount = 0;
    let alreadyEncryptedCount = 0;
    let errorCount = 0;

    for (const user of users) {
      if (!user.apiKey) {
        console.log(`Użytkownik ${user.username} nie ma klucza API. Pomijam.`);
        continue;
      }

      if (looksEncrypted(user.apiKey)) {
        console.log(
          `Klucz API użytkownika ${user.username} wygląda na już zaszyfrowany. Pomijam.`
        );
        alreadyEncryptedCount++;
        continue;
      }

      try {
        if (user.apiKey.length > 10) {
          const visiblePrefix = user.apiKey.substring(0, 6);
          const visibleSuffix = user.apiKey.substring(user.apiKey.length - 4);
          const maskedKey = `${visiblePrefix}${'*'.repeat(
            Math.max(0, user.apiKey.length - 10)
          )}${visibleSuffix}`;
          console.log(
            `Szyfrowanie klucza API dla użytkownika ${user.username} (${maskedKey})...`
          );
        } else {
          console.log(
            `Szyfrowanie klucza API dla użytkownika ${user.username}...`
          );
        }

        const encryptedKey = encryptApiKey(user.apiKey);

        if (encryptedKey === user.apiKey) {
          console.log(
            `Klucz API użytkownika ${user.username} nie uległ zmianie podczas szyfrowania. Możliwy problem.`
          );
          continue;
        }

        await User.updateOne(
          { _id: user._id },
          { $set: { apiKey: encryptedKey } }
        );

        console.log(`Zaszyfrowano klucz API dla użytkownika ${user.username}.`);
        encryptedCount++;
      } catch (error) {
        console.error(
          `Błąd podczas szyfrowania klucza API dla użytkownika ${user.username}:`,
          error
        );
        errorCount++;
      }
    }

    console.log(`Zakończono szyfrowanie kluczy API.`);
    console.log(`Wyniki:`);
    console.log(`- Zaszyfrowano: ${encryptedCount} kluczy`);
    console.log(
      `- Pominięto (już zaszyfrowane): ${alreadyEncryptedCount} kluczy`
    );
    console.log(`- Błędy: ${errorCount} kluczy`);

    if (
      encryptedCount === 0 &&
      alreadyEncryptedCount === 0 &&
      errorCount === 0
    ) {
      console.log(`Nie znaleziono kluczy API do szyfrowania.`);
    }

    const unsecuredUsers = await User.find({
      apiKey: {
        $exists: true,
        $ne: null,
        $nin: [''],
        $not: { $regex: /^[0-9a-f]{32}:[0-9a-f]+$/i },
      },
    });

    if (unsecuredUsers.length > 0) {
      console.warn(
        `⚠️ UWAGA: Znaleziono ${unsecuredUsers.length} użytkowników z niezaszyfrowanymi kluczami API!`
      );
      console.warn(`Sprawdź logi powyżej, aby zobaczyć szczegóły błędów.`);

      for (const user of unsecuredUsers) {
        try {
          if (!user.apiKey) {
            console.warn(
              `- Użytkownik ${user.username} (${user._id}): brak klucza`
            );
            continue;
          }

          if (user.apiKey.length > 8) {
            const maskedKey = `${user.apiKey.substring(
              0,
              4
            )}...${user.apiKey.substring(user.apiKey.length - 4)}`;
            console.warn(
              `- Użytkownik ${user.username} (${user._id}): ${maskedKey}`
            );
          } else {
            console.warn(
              `- Użytkownik ${user.username} (${
                user._id
              }): ${user.apiKey.substring(0, 2)}...`
            );
          }
        } catch (error) {
          console.warn(
            `- Użytkownik ${user.username} (${user._id}): błąd podczas maskowania klucza`
          );
        }
      }
    } else {
      console.log(
        `✓ Wszystkie klucze API w bazie danych są teraz zaszyfrowane.`
      );
    }
  } catch (error) {
    console.error('Błąd podczas szyfrowania kluczy API:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Rozłączono z bazą danych MongoDB');
    process.exit(0);
  }
};

console.log('=== ENCRYPT API SCRIPT ===');
console.log(new Date().toISOString());
encryptAllApiKeys();
