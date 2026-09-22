import mongoose from 'mongoose';

export interface MFA {
  userId: number;
  email: string;
  secret: string;
}

export const mfaSchema = new mongoose.Schema<MFA>({
  userId: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  secret: {
    type: String,
    required: true,
  },
});

export const MFAModel = mongoose.model<MFA>('MFA', mfaSchema);
