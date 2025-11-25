import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Reservation from '@/lib/models/Reservation';
import Book from '@/lib/models/Book';

export async function POST(req: Request) {
  await dbConnect();
  const { reservationId } = await req.json();
  const reservation = await Reservation.findById(reservationId);
  if (!reservation || reservation.returned) {
    return NextResponse.json({ message: 'Invalid reservation.' }, { status: 400 });
  }
  reservation.returned = true;
  reservation.returnedAt = new Date();
  await reservation.save();
  // Mark book as available again
  const book = await Book.findById(reservation.bookId);
  if (book) {
    book.available = true;
    await book.save();
  }
  return NextResponse.json({ message: 'Book returned successfully.' });
}
