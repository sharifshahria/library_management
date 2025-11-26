import mongoose, { Schema, Document, models } from 'mongoose';

export interface IBorrow extends Document {
  userEmail: string;
  bookId: string;
  borrowedAt: Date;
  dueDate: Date;
  returned: boolean;
  returnedAt?: Date;
}

const BorrowSchema: Schema = new Schema({
  userEmail: { type: String, required: true },
  bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
  borrowedAt: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  returned: { type: Boolean, default: false },
  returnedAt: { type: Date },
});

const Borrow = models.Borrow || mongoose.model<IBorrow>('Borrow', BorrowSchema);

export default Borrow;
