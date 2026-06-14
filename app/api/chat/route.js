export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Brak klucza GEMINI_API_KEY w konfiguracji serwera (.env.local)"
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const { message, history = [], context = {} } = await request.json();

    if (!message) {
      return new Response(
        JSON.stringify({ success: false, error: "Wiadomość jest wymagana" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { weatherData, newsData, calendarEvents } = context;

    // Build context-aware system instructions
    let systemInstructionText = `Jesteś pomocnym, zwięzłym i uprzejmym osobistym asystentem AI wbudowanym w dashboard użytkownika. Twoje imię to Gemini.
Rozmawiasz z użytkownikiem po polsku.

Masz dostęp do aktualnych danych z widżetów użytkownika na dzisiaj:
`;

    if (weatherData) {
      systemInstructionText += `
[POGODA]
Lokalizacja: ${weatherData.location}
Temperatura: ${weatherData.temperature}°C
Warunki: ${weatherData.description} ${weatherData.emoji}
`;
    } else {
      systemInstructionText += `\n[POGODA]\nBrak aktualnych danych o pogodzie.\n`;
    }

    if (calendarEvents && calendarEvents.length > 0) {
      systemInstructionText += `
[KALENDARZ NA DZIŚ]
${calendarEvents.map(e => `- ${e.time}: ${e.title} (${e.description || 'brak opisu'})`).join("\n")}
`;
    } else {
      systemInstructionText += `\n[KALENDARZ NA DZIŚ]\nBrak zaplanowanych wydarzeń na dziś.\n`;
    }

    if (newsData && newsData.length > 0) {
      systemInstructionText += `
[WIADOMOŚCI ZE ŚWIATA]
${newsData.map(n => `- ${n.source}: ${n.title} (${n.description})`).join("\n")}
`;
    } else {
      systemInstructionText += `\n[WIADOMOŚCI ZE ŚWIATA]\nBrak aktualnych wiadomości.\n`;
    }

    systemInstructionText += `
Zasady odpowiedzi:
1. Odpowiadaj zwięźle (maksymalnie 2-3 zdania), chyba że użytkownik wyraźnie poprosi o dłuższą analizę lub wyjaśnienie.
2. Pisz naturalnie, przyjaźnie, używając języka polskiego.
3. Gdy użytkownik pyta o swoje plany, pogodę lub wiadomości, korzystaj bezpośrednio z danych podanych powyżej.
4. Formatuj odpowiedzi w czytelny sposób za pomocą Markdown (pogrubienia, listy).
`;

    // Map history to Gemini API format
    const contents = history.map(item => ({
      role: item.sender === "user" ? "user" : "model",
      parts: [{ text: item.text }]
    }));

    // Add current user message
    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents,
        systemInstruction: {
          parts: [{ text: systemInstructionText }]
        },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API returned status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Przepraszam, nie mogłem wygenerować odpowiedzi.";

    return new Response(
      JSON.stringify({ success: true, reply }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store"
        }
      }
    );
  } catch (error) {
    console.error("Gemini API Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Błąd podczas komunikacji z Gemini: " + error.message
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
