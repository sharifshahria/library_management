import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Borrow from '@/lib/models/Borrow';
import Book from '@/lib/models/Book';

const validateDueDate = (dueDate?: string) => {
  if (!dueDate) return null;
  const parsed = new Date(dueDate);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
};

export async function POST(req: Request) {
  await dbConnect();
  const { userEmail, bookId, dueDate } = await req.json();

  if (!userEmail || !bookId) {
    return NextResponse.json(
      { message: 'User email and book are required.' },
      { status: 400 }
    );
  }

  const parsedDueDate = validateDueDate(dueDate);
  if (!parsedDueDate) {
    return NextResponse.json(
      { message: 'A valid return date is required.' },
      { status: 400 }
    );
  }

  if (parsedDueDate < new Date()) {
    return NextResponse.json(
      { message: 'Return date must be in the future.' },
      { status: 400 }
    );
  }

  // Check if book is available
  const book = await Book.findById(bookId);
  if (!book || !book.available) {
    return NextResponse.json({ message: 'Book not available.' }, { status: 400 });
  }

  // Mark book as borrowed
  book.available = false;
  await book.save();

  // Create borrow record
  const borrow = new Borrow({ userEmail, bookId, dueDate: parsedDueDate });
  await borrow.save();

  return NextResponse.json({ message: 'Book borrowed successfully.' });
}
