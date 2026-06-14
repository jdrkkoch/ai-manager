import { prisma } from '@/lib/prisma';
import { generateToken, setAuthCookie } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// Disable static generation for this API route
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { username, email, password, passwordConfirm } = await request.json();

    // Validation
    if (!username || !email || !password) {
      return new Response(
        JSON.stringify({ success: false, error: 'All fields are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (password !== passwordConfirm) {
      return new Response(
        JSON.stringify({ success: false, error: 'Passwords do not match' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (password.length < 6) {
      return new Response(
        JSON.stringify({ success: false, error: 'Password must be at least 6 characters' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      return new Response(
        JSON.stringify({ success: false, error: 'Username or email already exists' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    // Generate token
    const token = generateToken(user.id);

    // Set cookie and return token
    const response = new Response(
      JSON.stringify({ success: true, token, userId: user.id }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );

    setAuthCookie(response, token);
    return response;
  } catch (error) {
    console.error('Register error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
