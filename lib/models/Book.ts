import mongoose, { Schema, Document, models } from 'mongoose';

export interface IBook extends Document {
  title: string;
  author: string;
  available: boolean;
}

const BookSchema: Schema = new Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  available: { type: Boolean, default: true },
});

const Book = models.Book || mongoose.model<IBook>('Book', BookSchema);

export default Book;
