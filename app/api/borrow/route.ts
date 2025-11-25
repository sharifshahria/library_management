import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Borrow from '@/lib/models/Borrow';
import Book from '@/lib/models/Book';

export async function POST(req: Request) {
  await dbConnect();
  const { userEmail, bookId } = await req.json();

  // Check if book is available
  const book = await Book.findById(bookId);
  if (!book || !book.available) {
    return NextResponse.json({ message: 'Book not available.' }, { status: 400 });
  }

  // Mark book as borrowed
  book.available = false;
  await book.save();

  // Create borrow record
  const borrow = new Borrow({ userEmail, bookId });
  await borrow.save();

  return NextResponse.json({ message: 'Book borrowed successfully.' });
}
