"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    
    if (isLoggedIn === "true") {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [router]);

  if (!mounted) {
    return (
      <div className="auth-wrapper" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div className="spinner"></div>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", letterSpacing: "0.05em" }}>
          Ładowanie panelu...
        </p>
      </div>
    );
  }

  return (
    <div className="auth-wrapper" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div className="spinner"></div>
      <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", letterSpacing: "0.05em" }}>
        Ładowanie panelu...
      </p>
    </div>
  );
}
