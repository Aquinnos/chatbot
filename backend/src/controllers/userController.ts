import { Request, Response } from 'express';
import User from '../models/user';
import jwt from 'jsonwebtoken';

export const createUser = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  try {
    const exitstingEmail = await User.findOne({ email });
    if (exitstingEmail) {
      res.status(400).json({ message: 'Email already exists' });
      return;
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      res.status(400).json({ message: 'Username already exists' });
      return;
    }

    const newUser = new User({ username, email, password });
    await newUser.save();

    res.status(201).json({
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const passwordIsMatch = await user.comparePassword(password);
    if (!passwordIsMatch) {
      res.status(401).json({ message: 'Invalid password' });
      return;
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'secret-key',
      { expiresIn: '30d' }
    );

    // Nie ustawiaj domyślnego klucza API - wyślij taki, jaki jest w bazie danych
    // Dzięki temu jeśli użytkownik nie ma klucza API, to nie zostanie on automatycznie ustawiony
    // if (!user.apiKey) {
    //   console.log(`User ${user.username} has no API key. Setting default key.`);
    //   user.apiKey = DEFAULT_API_KEY;
    //   await user.save();
    //   console.log(`Default API key has been set for user ${user.username}`);
    // }

    const decryptedApiKey = user.getDecryptedApiKey();

    res.status(200).json({
      id: user._id,
      username: user.username,
      email: user.email,
      token,
      apiKey: decryptedApiKey,
    });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ message: 'Error logging in user' });
    return;
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    // @ts-ignore - user is not defined in the Request type
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const decryptedApiKey = user.getDecryptedApiKey();

    const responseUser = {
      id: user._id,
      username: user.username,
      email: user.email,
      apiKey: decryptedApiKey,
      offlineMode: user.offlineMode,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.status(200).json(responseUser);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user profile' });
    console.error('Error fetching user profile:', error);
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  try {
    // @ts-ignore - user is not defined in the Request type
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (username) user.username = username;
    if (email) user.email = email;
    if (password) user.password = password;

    await user.save();

    const updatedUser = await User.findById(user._id).select('-password');
    if (!updatedUser) {
      res.status(404).json({ message: 'User not found after update' });
      return;
    }

    const responseUser = {
      id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
    };

    res.status(200).json(responseUser);
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile' });
    console.error('Error updating profile:', error);
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    // @ts-ignore - user is not defined in the Request type
    const user = await User.findByIdAndDelete(req.user.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user' });
    console.error('Error deleting user:', error);
  }
};

export const updateApiKey = async (req: Request, res: Response) => {
  try {
    const { apiKey } = req.body;
    // @ts-ignore - user is not defined in the Request type
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    user.apiKey = apiKey;
    await user.save();

    const updatedUser = await User.findById(userId).select('-password');
    if (!updatedUser) {
      res.status(500).json({ message: 'Error fetching updated user' });
      return;
    }

    const decryptedApiKey = updatedUser.getDecryptedApiKey();

    const responseUser = {
      id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      apiKey: decryptedApiKey,
      offlineMode: updatedUser.offlineMode,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };

    res.status(200).json(responseUser);
  } catch (error) {
    res.status(500).json({ message: 'Error updating API key' });
    console.error('Error updating API key:', error);
  }
};
