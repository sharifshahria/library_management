import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Borrow from '@/lib/models/Borrow';
import Book from '@/lib/models/Book';

export async function GET(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const userEmail = searchParams.get('userEmail');
  const query: any = { returned: false };
  if (userEmail) query.userEmail = userEmail;
  const borrows = await Borrow.find(query).populate('bookId');
  return NextResponse.json(borrows);
}

export async function POST(req: Request) {
  await dbConnect();
  const { borrowId } = await req.json();
  const borrow = await Borrow.findById(borrowId);
  if (!borrow || borrow.returned) {
    return NextResponse.json({ message: 'Invalid borrow record.' }, { status: 400 });
  }
  borrow.returned = true;
  await borrow.save();
  // Mark book as available again
  const book = await Book.findById(borrow.bookId);
  if (book) {
    book.available = true;
    await book.save();
  }
  return NextResponse.json({ message: 'Book returned successfully.' });
}
