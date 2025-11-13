import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
  await dbConnect();
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ message: 'Email and password are required.' }, { status: 400 });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return NextResponse.json({ message: 'Invalid email or password.' }, { status: 401 });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return NextResponse.json({ message: 'Invalid email or password.' }, { status: 401 });
  }

  // Generate JWT token
  const token = jwt.sign(
    { userId: user._id, name: user.name, email: user.email },
    process.env.JWT_SECRET || 'default_secret',
    { expiresIn: '1h' }
  );

  return NextResponse.json({ message: 'Login successful.', token, user: { name: user.name, email: user.email } });
}
