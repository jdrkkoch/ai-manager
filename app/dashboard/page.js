"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  // Widget Data states
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [calendarLoading, setCalendarLoading] = useState(true);
  const [calendarError, setCalendarError] = useState(null);

  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState(null);

  const [newsData, setNewsData] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState(null);

  // Gemini AI Assistant states
  const [messages, setMessages] = useState([
    { sender: "model", text: "Cześć! Jestem Twoim asystentem Gemini. W czym mogę Ci dzisiaj pomóc? Znam Twój dzisiejszy kalendarz, aktualną pogodę oraz najnowsze wiadomości." }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatContainerRef = useRef(null);

  const [currentDateString, setCurrentDateString] = useState("");

  // 1. Session check and hydration
  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.replace("/login");
    } else {
      setCheckingAuth(false);
    }
  }, [router]);

  // 2. Set client-side date (only after mount)
  useEffect(() => {
    if (!mounted) return;
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    setCurrentDateString(new Date().toLocaleDateString("pl-PL", options));
  }, [mounted]);

  // 3. Fetch Calendar Events
  useEffect(() => {
    if (checkingAuth) return;

    const fetchCalendar = async () => {
      try {
        const res = await fetch("/api/calendar");
        if (!res.ok) throw new Error("Failed to fetch calendar");
        const data = await res.json();
        setCalendarEvents(data);
      } catch (err) {
        console.error(err);
        setCalendarError("Nie udało się załadować kalendarza");
      } finally {
        setCalendarLoading(false);
      }
    };

    fetchCalendar();
  }, [checkingAuth]);

  // 4. Fetch Weather Data with Geolocation
  useEffect(() => {
    if (checkingAuth) return;

    const fetchWeather = async (lat = null, lon = null) => {
      try {
        let url = "/api/weather";
        if (lat && lon) {
          url += `?lat=${lat}&lon=${lon}`;
        }
        
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch weather");
        const data = await res.json();
        setWeatherData(data);
      } catch (err) {
        console.error(err);
        setWeatherError("Nie udało się załadować pogody");
      } finally {
        setWeatherLoading(false);
      }
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.log("Geolocation permission denied or error. Using default Warsaw location.", error);
          fetchWeather();
        },
        { timeout: 8000 }
      );
    } else {
      fetchWeather();
    }
  }, [checkingAuth]);

  // 5. Fetch News Stories
  useEffect(() => {
    if (checkingAuth) return;

    const fetchNews = async () => {
      try {
        const res = await fetch("/api/news");
        if (!res.ok) throw new Error("Failed to fetch news");
        const data = await res.json();
        setNewsData(data);
      } catch (err) {
        console.error(err);
        setNewsError("Nie udało się załadować wiadomości");
      } finally {
        setNewsLoading(false);
      }
    };

    fetchNews();
  }, [checkingAuth]);

  // Scroll only the chat container to bottom (not the page)
  const scrollChatToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  // Handle Gemini Message sending
  const handleSendChatMessage = async (textToSend) => {
    const text = textToSend || chatInput;
    if (!text.trim() || chatLoading) return;

    const userMessage = { sender: "user", text };
    setMessages(prev => [...prev, userMessage]);
    setChatInput("");
    setChatLoading(true);

    // Scroll chat container after adding user message
    setTimeout(scrollChatToBottom, 50);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: messages,
          context: {
            weatherData,
            newsData,
            calendarEvents
          }
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setMessages(prev => [...prev, { sender: "model", text: data.reply }]);
      } else {
        setMessages(prev => [...prev, { 
          sender: "model", 
          text: `Błąd: ${data.error || "Nie udało się uzyskać odpowiedzi od Gemini."}` 
        }]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { 
        sender: "model", 
        text: "Wystąpił błąd połączenia z asystentem Gemini. Spróbuj ponownie później." 
      }]);
    } finally {
      setChatLoading(false);
      setTimeout(scrollChatToBottom, 50);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    router.replace("/login");
  };

  // Show loading during hydration or auth check
  if (!mounted || checkingAuth) {
    return (
      <div className="auth-wrapper" style={{ flexDirection: "column", gap: "1rem" }}>
        <div className="spinner"></div>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Sprawdzanie sesji...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Witaj, Admin</h1>
          <p>{currentDateString || "Plan dnia"}</p>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Wyloguj
        </button>
      </header>

      {/* Main Grid */}
      <main className="dashboard-grid">
        
        {/* Left Column: Calendar & Weather */}
        <div className="dashboard-column">
          
          {/* Calendar Widget */}
          <section className="widget-card">
            <div className="widget-title">Kalendarz</div>
            
            {calendarLoading ? (
              <div className="loading-spinner-container">
                <div className="spinner"></div>
              </div>
            ) : calendarError ? (
              <div className="no-events" style={{ color: "var(--accent-red)" }}>
                {calendarError}
              </div>
            ) : calendarEvents.length === 0 ? (
              <div className="no-events">Brak zaplanowanych wydarzeń na dziś.</div>
            ) : (
              <div className="calendar-list">
                {calendarEvents.map((event) => (
                  <div 
                    key={event.id} 
                    className="calendar-item"
                    style={{ borderLeftColor: event.color || "var(--accent-blue)" }}
                  >
                    <div className="calendar-time">{event.time}</div>
                    <div className="calendar-details">
                      <div className="calendar-event-title">{event.title}</div>
                      {event.description && (
                        <div className="calendar-event-desc">{event.description}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Weather Widget */}
          <section className="widget-card weather-widget">
            <div className="widget-title">Pogoda</div>
            
            {weatherLoading ? (
              <div className="loading-spinner-container">
                <div className="spinner"></div>
              </div>
            ) : weatherError ? (
              <div className="no-events" style={{ color: "var(--accent-red)", minHeight: "80px" }}>
                {weatherError}
              </div>
            ) : (
              <>
                <div className="weather-header">
                  <div className="weather-location">
                    <span className="weather-city">{weatherData.location}</span>
                    <span className="weather-subtitle">Aktualna pogoda</span>
                  </div>
                  <span className="weather-emoji">{weatherData.emoji}</span>
                </div>
                
                <div className="weather-body">
                  <div className="weather-temp-container">
                    <span className="weather-temp">{weatherData.temperature}</span>
                    <span className="weather-unit">°C</span>
                  </div>
                  <div className="weather-condition">
                    {weatherData.description}
                  </div>
                </div>
              </>
            )}
          </section>

        </div>

        {/* Right Column: Gemini Assistant & News */}
        <div className="dashboard-column">
          
          {/* Gemini AI Assistant Widget */}
          <section className="widget-card gemini-widget" style={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
            <div className="widget-title">Asystent Gemini</div>
            
            {/* Chat Messages */}
            <div className="chat-container" ref={chatContainerRef}>
              {messages.map((msg, i) => (
                <div key={i} className={`chat-bubble-wrapper ${msg.sender === "user" ? "user" : "model"}`}>
                  <div className="chat-avatar">{msg.sender === "user" ? "Ty" : "AI"}</div>
                  <div className="chat-bubble">
                    <p style={{ whiteSpace: "pre-line" }}>{msg.text}</p>
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="chat-bubble-wrapper model">
                  <div className="chat-avatar">AI</div>
                  <div className="chat-bubble typing">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Action Pills */}
            <div className="quick-actions">
              <button 
                className="quick-pill" 
                onClick={() => handleSendChatMessage("Co mam dzisiaj w planach?")}
                disabled={chatLoading}
              >
                Co w planach?
              </button>
              <button 
                className="quick-pill" 
                onClick={() => handleSendChatMessage("Jaka jest dzisiaj pogoda i w co się ubrać?")}
                disabled={chatLoading}
              >
                Jaka pogoda?
              </button>
              <button 
                className="quick-pill" 
                onClick={() => handleSendChatMessage("Streść najważniejsze wiadomości ze świata.")}
                disabled={chatLoading}
              >
                Streść newsy
              </button>
            </div>

            {/* Chat Input Form */}
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSendChatMessage(); }} 
              className="chat-input-form"
            >
              <input
                type="text"
                className="chat-input"
                placeholder="Zadaj pytanie asystentowi..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                disabled={chatLoading}
              />
              <button 
                type="submit" 
                className="chat-send-btn"
                disabled={chatLoading || !chatInput.trim()}
              >
                Wyślij
              </button>
            </form>
          </section>

          {/* News Widget */}
          <section className="widget-card">
            <div className="widget-title">Wiadomości ze świata</div>
            
            {newsLoading ? (
              <div className="loading-spinner-container">
                <div className="spinner"></div>
              </div>
            ) : newsError ? (
              <div className="no-events" style={{ color: "var(--accent-red)" }}>
                {newsError}
              </div>
            ) : newsData.length === 0 ? (
              <div className="no-events">Brak dostępnych wiadomości.</div>
            ) : (
              <div className="news-list">
                {newsData.map((article) => (
                  <div key={article.id} className="news-item">
                    <div className="news-meta">
                      {article.source && (
                        <span className="news-source">{article.source}</span>
                      )}
                      {article.source && article.time && (
                        <span className="news-bullet">•</span>
                      )}
                      {article.time && <span>{article.time}</span>}
                    </div>
                    <div className="news-title">{article.title}</div>
                    {article.description && (
                      <p className="news-desc">{article.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      </main>
    </div>
  );
}
