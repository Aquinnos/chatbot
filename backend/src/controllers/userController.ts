import e, { Request, Response } from 'express';
import User from '../models/user';
import jwt, { SignOptions } from 'jsonwebtoken';

export const createUser = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  try {
    const exitstingEmail = await User.findOne({ email });
    if (exitstingEmail) {
      res.status(400).json({ message: 'Email already exists' });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      res.status(400).json({ message: 'Username already exists' });
    }

    const newUser = new User({ username, email, password });
    await newUser.save();

    res.status(201).json({
      id: newUser._id,
      username: newUser.username,
      password: newUser.password,
      email: newUser.email,
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid password' });
      return;
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, username: user.username },
      process.env.JWT_SECRET || 'defaultsecret',
      { expiresIn: process.env.JWT_EXPIRATION || '1d' } as SignOptions
    );

    res.status(200).json({
      id: user._id,
      username: user.username,
      email: user.email,
      token,
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
    res.status(200).json(user);
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

    res.status(200).json({
      id: user._id,
      username: user.username,
      email: user.email,
    });
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

    const user = await User.findByIdAndUpdate(
      userId,
      { apiKey },
      { new: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating API key' });
    console.error('Error updating API key:', error);
  }
};
