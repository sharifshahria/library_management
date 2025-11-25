import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Book from '@/lib/models/Book';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const { title, author } = await req.json();
  await Book.findByIdAndUpdate(params.id, { title, author });
  return NextResponse.json({ message: 'Book updated.' });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  await Book.findByIdAndDelete(params.id);
  return NextResponse.json({ message: 'Book deleted.' });
}
