export async function POST(request) {
  try {
    const { username, password } = await request.json();

    // Use environment variables instead of hardcoded values
    const validUsername = process.env.NEXT_PUBLIC_ADMIN_USERNAME || "admin";
    const validPassword = process.env.ADMIN_PASSWORD || "admin";

    if (username === validUsername && password === validPassword) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: false, error: "Incorrect login or password" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: "Invalid request payload" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
