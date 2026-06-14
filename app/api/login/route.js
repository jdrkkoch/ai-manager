export async function POST(request) {
  try {
    const { username, password } = await request.json();

    // Get credentials from environment variables (REQUIRED)
    const validUsername = process.env.NEXT_PUBLIC_ADMIN_USERNAME;
    const validPassword = process.env.ADMIN_PASSWORD;

    // Check if environment variables are set
    if (!validUsername || !validPassword) {
      console.error("❌ Missing environment variables: NEXT_PUBLIC_ADMIN_USERNAME or ADMIN_PASSWORD");
      return new Response(JSON.stringify({ success: false, error: "Server configuration error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

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
