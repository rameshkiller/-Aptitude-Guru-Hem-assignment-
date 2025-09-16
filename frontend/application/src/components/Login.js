import React, { useState, useEffect } from "react";
import { API } from "./api";
import "./login.css";

export default function Login({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  // Check localStorage for token on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userName = localStorage.getItem("userName");
    const userId = localStorage.getItem("userId");

    if (token && userId && userName) {
      onAuth({ id: userId, name: userName, token });
    }
  }, [onAuth]);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    try {
      let res;
      if (mode === "register") {
        res = await API.post("/auth/register", { name, email, password });
      } else {
        res = await API.post("/auth/login", { email, password });
      }

      //  Store token + user in localStorage
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.user.id);
      localStorage.setItem("userName", res.data.user.name);

      onAuth(res.data.user);
    } catch (error) {
      console.error("Auth error:", error);
      setErr(error?.response?.data?.message || "Auth failed");
    }
  };

  const logout = () => {
    // Clear localStorage and reset auth state
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    onAuth(null);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>{mode === "register" ? "Register" : "Login"}</h2>
        <form onSubmit={submit}>
          {mode === "register" && (
            <div>
              <label>Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}
          <div className="email-field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="password-field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">
            {mode === "register" ? "Register" : "Login"}
          </button>
          <button
            type="button"
            onClick={() => setMode(mode === "register" ? "login" : "register")}
            className="switch-btn"
          >
            {mode === "register" ? "Switch to Login" : "Switch to Register"}
          </button>
          {err && <p className="error">{err}</p>}
          {/* Logout button */}
          {localStorage.getItem("token") && (
            <button type="button" onClick={logout} className="logout-btn">
              Logout
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

