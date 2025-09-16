import React, { useState } from "react";
import Login from "./components/Login";
import Quiz from "./components/Quiz"; // Import the Quiz component

function App() {
  const [user, setUser] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false); // New state to toggle quiz

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>LMS Micro-Certification Portal</h1>

      {!user ? (
        <Login onAuth={(u) => setUser(u)} />
      ) : (
        <div>
          <p>Welcome, {user.name}!</p>
          <div style={{ marginBottom: 20 }}>
            <button
              onClick={() => setShowQuiz(!showQuiz)}
              style={{ marginRight: 10 }}
            >
              {showQuiz ? "Hide Quiz" : "Start Quiz"}
            </button>
            <button
              onClick={() => {
                localStorage.removeItem("token");
                setUser(null);
                setShowQuiz(false); // reset quiz visibility
              }}
            >
              Logout
            </button>
          </div>

          {showQuiz && <Quiz />} {/* Show Quiz only when toggled */}
        </div>
      )}
    </div>
  );
}

export default App;
