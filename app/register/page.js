"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Only run auth check after hydration
  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("auth_token");
    if (token) {
      router.replace("/dashboard");
    } else {
      setCheckingAuth(false);
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Client validation
    if (password !== passwordConfirm) {
      setError("Hasła się nie zgadzają");
      return;
    }

    if (password.length < 6) {
      setError("Hasło musi mieć co najmniej 6 znaków");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, passwordConfirm }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem("auth_token", data.token);
        router.push("/dashboard");
      } else {
        setError(data.error || "Rejestracja nie powiodła się");
      }
    } catch (err) {
      console.error(err);
      setError("Wystąpił błąd. Spróbuj ponownie.");
    } finally {
      setLoading(false);
    }
  };

  // Show loading during hydration
  if (!mounted || checkingAuth) {
    return (
      <div className="auth-wrapper" style={{ flexDirection: "column", gap: "1rem" }}>
        <div className="spinner"></div>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Ładowanie...</p>
      </div>
    );
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2 className="auth-title">Rejestracja</h2>
        <p className="auth-subtitle">Utwórz nowe konto</p>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          <div className="input-group">
            <label className="input-label" htmlFor="username">
              Nazwa użytkownika
            </label>
            <input
              type="text"
              id="username"
              className="auth-input"
              placeholder="Twoja nazwa użytkownika"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="auth-input"
              placeholder="twoj@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="password">
              Hasło
            </label>
            <input
              type="password"
              id="password"
              className="auth-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="passwordConfirm">
              Potwierdź hasło
            </label>
            <input
              type="password"
              id="passwordConfirm"
              className="auth-input"
              placeholder="••••••••"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Rejestracja..." : "Zarejestruj się"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "1rem", color: "var(--text-secondary)" }}>
          Masz już konto? <Link href="/login" style={{ color: "var(--accent-blue)", textDecoration: "none" }}>Zaloguj się</Link>
        </p>
      </div>
    </div>
  );
}
