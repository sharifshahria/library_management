import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Book from '@/lib/models/Book';

export async function GET() {
  await dbConnect();
  const books = await Book.find();
  return NextResponse.json(books);
}

export async function POST(req: Request) {
  await dbConnect();
  const { title, author } = await req.json();
  if (!title || !author) {
    return NextResponse.json({ message: 'Title and author required.' }, { status: 400 });
  }
  const book = new Book({ title, author });
  await book.save();
  return NextResponse.json(book);
}
