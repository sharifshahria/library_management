import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';

export async function GET() {
  try {
    await dbConnect();
    return NextResponse.json({ message: 'MongoDB connection successful!' });
  } catch (error) {
    return NextResponse.json({ message: 'MongoDB connection failed', error: String(error) }, { status: 500 });
  }
}
