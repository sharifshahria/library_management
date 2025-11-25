import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Reservation from '@/lib/models/Reservation';
import Book from '@/lib/models/Book';

export async function GET(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const userEmail = searchParams.get('userEmail');
  const query: any = {};
  if (userEmail) query.userEmail = userEmail;
  const reservations = await Reservation.find(query).populate('bookId');
  return NextResponse.json(reservations);
}

export async function POST(req: Request) {
  await dbConnect();
  const { userEmail, bookId } = await req.json();
  // Check if book is available
  const book = await Book.findById(bookId);
  if (!book || !book.available) {
    return NextResponse.json({ message: 'Book not available.' }, { status: 400 });
  }
  // Mark book as reserved
  book.available = false;
  await book.save();
  // Create reservation record
  const reservation = new Reservation({ userEmail, bookId });
  await reservation.save();
  return NextResponse.json({ message: 'Book reserved successfully.' });
}
