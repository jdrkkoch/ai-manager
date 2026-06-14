export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("lat") || "52.2297";
    const lon = searchParams.get("lon") || "21.0122";
    const locationName = searchParams.get("name") || (searchParams.get("lat") ? "Current Location" : "Warsaw");

    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
    
    const response = await fetch(apiUrl, {
      next: { revalidate: 900 } // Cache results for 15 minutes
    });

    if (!response.ok) {
      throw new Error(`Open-Meteo API returned status ${response.status}`);
    }

    const data = await response.json();
    const current = data.current_weather;

    if (!current) {
      throw new Error("No current weather data in response");
    }

    const weatherCode = current.weathercode;
    const temperature = Math.round(current.temperature);
    
    // Map Open-Meteo weather code to human description & emoji
    let description = "Unknown";
    let emoji = "🌡️";

    if (weatherCode === 0) {
      description = "Sunny/Clear";
      emoji = "☀️";
    } else if ([1, 2, 3].includes(weatherCode)) {
      description = "Partly Cloudy";
      emoji = "⛅";
    } else if ([45, 48].includes(weatherCode)) {
      description = "Foggy";
      emoji = "🌫️";
    } else if ([51, 53, 55].includes(weatherCode)) {
      description = "Light Drizzle";
      emoji = "🌦️";
    } else if ([56, 57].includes(weatherCode)) {
      description = "Freezing Drizzle";
      emoji = "🌨️";
    } else if ([61, 63, 65].includes(weatherCode)) {
      description = "Rainy";
      emoji = "🌧️";
    } else if ([66, 67].includes(weatherCode)) {
      description = "Freezing Rain";
      emoji = "🌨️";
    } else if ([71, 73, 75].includes(weatherCode)) {
      description = "Snowy";
      emoji = "❄️";
    } else if (weatherCode === 77) {
      description = "Snow Grains";
      emoji = "❄️";
    } else if ([80, 81, 82].includes(weatherCode)) {
      description = "Rain Showers";
      emoji = "🌧️";
    } else if ([85, 86].includes(weatherCode)) {
      description = "Snow Showers";
      emoji = "🌨️";
    } else if (weatherCode === 95) {
      description = "Thunderstorm";
      emoji = "⚡";
    } else if ([96, 99].includes(weatherCode)) {
      description = "Severe Thunderstorm";
      emoji = "⛈️";
    }

    return new Response(
      JSON.stringify({
        temperature,
        description,
        emoji,
        location: locationName,
        windspeed: current.windspeed,
        winddirection: current.winddirection
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=900"
        }
      }
    );
  } catch (error) {
    console.error("Error fetching weather:", error);
    // Return mock weather fallback in case of API failure or network issue
    return new Response(
      JSON.stringify({
        temperature: 21,
        description: "Sunny (Fallback)",
        emoji: "☀️",
        location: "Warsaw (Offline)",
        fallback: true
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
