import { prisma } from '@/lib/prisma';
import { generateToken, setAuthCookie } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// Disable static generation for this API route
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return new Response(
        JSON.stringify({ success: false, error: 'Username and password required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Find user by username
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Incorrect login or password' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return new Response(
        JSON.stringify({ success: false, error: 'Incorrect login or password' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Generate token
    const token = generateToken(user.id);

    // Set cookie and return token
    const response = new Response(
      JSON.stringify({ success: true, token, userId: user.id }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

    setAuthCookie(response, token);
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
