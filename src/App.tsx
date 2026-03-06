import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { auth } from "./firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import Dashboard from "./Dashboard";
import Settings from "../pages/Settings";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Sign in with email and password from environment variables
    const email = import.meta.env.VITE_FIREBASE_USER_EMAIL;
    const password = import.meta.env.VITE_FIREBASE_USER_PASSWORD;

    if (!email || !password) {
      setError("Missing email or password in environment variables");
      return;
    }

    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        console.log("Signed in as:", email);
        setIsAuthenticated(true);
      })
      .catch((error) => {
        console.error("Authentication failed:", error);
        setError(error.message);
      });
  }, []);

  if (error) {
    return (
      <div style={{ padding: "20px", fontFamily: "Arial" }}>
        <h1>Authentication Error</h1>
        <p>{error}</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ padding: "20px", fontFamily: "Arial" }}>
        <h1>Authenticating...</h1>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
