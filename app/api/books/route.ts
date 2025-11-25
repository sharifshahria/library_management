import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Book from '@/lib/models/Book';

export async function GET(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') || '';
  const books = await Book.find({
    $or: [
      { title: { $regex: query, $options: 'i' } },
      { author: { $regex: query, $options: 'i' } }
    ]
  });
  return NextResponse.json(books);
}
