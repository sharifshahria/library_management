import mongoose, { Schema, Document, models } from 'mongoose';

export interface IBorrow extends Document {
  userEmail: string;
  bookId: string;
  borrowedAt: Date;
  returned: boolean;
}

const BorrowSchema: Schema = new Schema({
  userEmail: { type: String, required: true },
  bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
  borrowedAt: { type: Date, default: Date.now },
  returned: { type: Boolean, default: false },
});

const Borrow = models.Borrow || mongoose.model<IBorrow>('Borrow', BorrowSchema);

export default Borrow;
