import { Request, Response } from 'express';
import OfflineResponse from '../models/offlineResponse';
import User from '../models/user';

interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

export const saveOfflineResponse = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const userId = req.user.id;
    const { query, response, chatId } = req.body;

    if (!query || !response) {
      res.status(400).json({ message: 'Query and response are required' });
      return;
    }

    const newOfflineResponse = new OfflineResponse({
      userId,
      query,
      response,
      chatId,
      used: false,
    });

    await newOfflineResponse.save();

    await User.findByIdAndUpdate(userId, {
      $push: { offlineResponses: newOfflineResponse._id },
    });

    res.status(201).json(newOfflineResponse);
  } catch (error) {
    console.error('Error saving offline response:', error);
    res.status(500).json({ message: 'Error saving offline response' });
  }
};

export const getOfflineResponses = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const userId = req.user.id;
    const response = await OfflineResponse.find({ userId }).sort({
      createdAt: -1,
    });

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching offline response:', error);
    res.status(500).json({ message: 'Error fetching offline response' });
  }
};

export const findMatchingResponse = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const userId = req.user.id;
    const { query } = req.body;

    if (!query) {
      res.status(400).json({ message: 'Query is required' });
      return;
    }

    let matchingResponse = await OfflineResponse.findOne({
      userId,
      query: query.toLowerCase(),
      used: false,
    }).sort({ createdAt: -1 });

    if (!matchingResponse) {
      res.status(404).json({ message: 'No matching response found' });
      return;
    }

    matchingResponse.used = true;
    await matchingResponse.save();

    res.status(200).json(matchingResponse);
  } catch (error) {
    console.error('Error finding matching response:', error);
    res.status(500).json({ message: 'Error finding matching response' });
  }
};

export const deleteOfflineResponse = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const userId = req.user.id;
    const responseId = req.params.id;

    const response = await OfflineResponse.findOneAndDelete({
      _id: responseId,
      userId,
    });

    if (!response) {
      res.status(404).json({ message: 'Response not found' });
      return;
    }

    await User.findByIdAndUpdate(userId, {
      $pull: { offlineResponses: response._id },
    });

    res.status(200).json({ message: 'Response deleted successfully' });
  } catch (error) {
    console.error('Error deleting offline response:', error);
    res.status(500).json({ message: 'Error deleting offline response' });
  }
};
