import mongoose, { Schema, Document } from 'mongoose';

export interface IPurchase extends Document {
  articleId: string;
  walletAddress: string;
  txid: string;
  satoshisPaid: number;
  purchasedAt: Date;
  verified: boolean;
}

const PurchaseSchema: Schema = new Schema(
  {
    articleId: {
      type: String,
      required: true,
      ref: 'Article',
    },
    walletAddress: {
      type: String,
      required: true,
      trim: true,
    },
    txid: {
      type: String,
      required: true,
      trim: true,
    },
    satoshisPaid: {
      type: Number,
      required: true,
      min: 0,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    purchasedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast lookup
PurchaseSchema.index({ walletAddress: 1, articleId: 1 });
PurchaseSchema.index({ txid: 1 }, { unique: true });

export default mongoose.model<IPurchase>('Purchase', PurchaseSchema);
