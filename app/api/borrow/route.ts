import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Book from '@/lib/models/Book';

export async function POST(req: Request) {
  await dbConnect();
  const { bookId, borrower } = await req.json();
  if (!bookId || !borrower) {
    return NextResponse.json({ message: 'Book ID and borrower required.' }, { status: 400 });
  }
  const book = await Book.findById(bookId);
  if (!book) {
    return NextResponse.json({ message: 'Book not found.' }, { status: 404 });
  }
  if (!book.available) {
    return NextResponse.json({ message: 'Book already borrowed.' }, { status: 409 });
  }
  book.available = false;
  book.borrower = borrower;
  await book.save();
  return NextResponse.json({ message: 'Book borrowed successfully.', book });
}

export async function PUT(req: Request) {
  await dbConnect();
  const { bookId } = await req.json();
  if (!bookId) {
    return NextResponse.json({ message: 'Book ID required.' }, { status: 400 });
  }
  const book = await Book.findById(bookId);
  if (!book) {
    return NextResponse.json({ message: 'Book not found.' }, { status: 404 });
  }
  book.available = true;
  book.borrower = null;
  await book.save();
  return NextResponse.json({ message: 'Book returned successfully.', book });
}
