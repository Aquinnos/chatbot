import mongoose, { Schema, Document } from 'mongoose';
import { off } from 'process';

export interface IOfflineResponse extends Document {
  query: string;
  response: string;
  userId: mongoose.Types.ObjectId;
  chatId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  used: boolean;
}

const offlineResponseSchema = new Schema<IOfflineResponse>(
  {
    query: {
      type: String,
      required: true,
      index: true,
    },
    response: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      index: true,
      ref: 'User',
    },
    chatId: {
      type: Schema.Types.ObjectId,
      index: true,
      ref: 'Chat',
    },
    used: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

offlineResponseSchema.index({ userId: 1, query: 1 });

const OfflineResponse = mongoose.model<IOfflineResponse>(
  'OfflineResponse',
  offlineResponseSchema
);

export default OfflineResponse;
