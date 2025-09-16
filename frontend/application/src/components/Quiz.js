import React, { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import axios from "axios";
import "./quiz.css";

// ---------------- Helper APIs ----------------
const fetchQuestions = async () => {
  try {
    const res = await axios.get("http://localhost:5000/quiz/questions");
    return res.data;
  } catch (error) {
    console.error("Error fetching questions:", error);
    throw new Error("Failed to load quiz questions. Please try again later.");
  }
};

const calculateScore = (questions, answers) => {
  return questions.reduce((total, q, index) => {
    return answers[index] === q.answer ? total + 1 : total;
  }, 0);
};

const generateCertificate = (userName, finalScore, totalQuestions, isPass) => {
  try {
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    doc.setFontSize(30);
    doc.text("Certificate of Achievement", 420, 100, { align: "center" });
    doc.setFontSize(20);
    doc.text(`This certificate is proudly presented to`, 420, 160, { align: "center" });
    doc.setFontSize(25);
    doc.text(userName || "Student", 420, 200, { align: "center" });
    doc.setFontSize(18);
    doc.text(
      `For successfully completing the quiz with a score of ${finalScore} / ${totalQuestions}`,
      420,
      260,
      { align: "center" }
    );
    doc.setFontSize(16);
    doc.text(`Status: ${isPass ? "Passed" : "Failed"}`, 420, 300, { align: "center" });

    const fileName = "certificate.pdf";
    doc.save(fileName);

    const blob = doc.output("blob");
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Error generating certificate:", error);
    return null;
  }
};

// ---------------- Main Component ----------------
export default function Quiz({ user, onLogout }) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [certificateLink, setCertificateLink] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [reviewedQuestions, setReviewedQuestions] = useState({});
  const [loadingError, setLoadingError] = useState("");

  // Load quiz questions
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const data = await fetchQuestions();
        setQuestions(data);
      } catch (err) {
        setLoadingError(err.message);
      }
    };
    loadQuestions();
  }, []);

  const handleNext = () => {
    if (!answers[currentIndex]) {
      setErrorMsg("Please select an option before proceeding!");
      return;
    }
    setErrorMsg("");

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      const total = calculateScore(questions, answers);
      setFinalScore(total);
      setScore(total);
      setShowResult(true);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
    setErrorMsg("");
  };

  const handleOptionChange = (option) => {
    setAnswers((prev) => ({ ...prev, [currentIndex]: option }));
    setErrorMsg("");
  };

  const toggleReview = () => {
    setReviewedQuestions((prev) => ({
      ...prev,
      [currentIndex]: !prev[currentIndex],
    }));
  };

  const handleDownloadCertificate = () => {
    const userName = localStorage.getItem("userName");
    const link = generateCertificate(userName, finalScore, questions.length, isPass);
    if (link) setCertificateLink(link);
  };

  const handleShareCertificate = async () => {
    if (!certificateLink) {
      alert("Please download the certificate first to generate a shareable link.");
      return;
    }
    try {
      await navigator.clipboard.writeText(certificateLink);
      alert("Certificate link copied to clipboard!");
    } catch (error) {
      console.error("Error sharing certificate:", error);
    }
  };

  const handleRetake = () => {
    setCurrentIndex(0);
    setAnswers({});
    setScore(0);
    setFinalScore(0);
    setShowResult(false);
    setQuizStarted(false);
    setCertificateLink("");
    setErrorMsg("");
    setReviewedQuestions({});
  };

  const isPass = finalScore / questions.length >= 0.5;

  if (!quizStarted) {
    return (
      <div className="quiz-container" style={{ textAlign: "center" }}>
        {user && <button className="logout-btn" onClick={onLogout}>Logout</button>}
        <h2>Welcome to the Quiz</h2>
        <button className="start-btn" onClick={() => setQuizStarted(true)}>Start Quiz</button>
      </div>
    );
  }

  if (loadingError) return <p style={{ color: "red" }}>{loadingError}</p>;
  if (questions.length === 0) return <p>Loading questions...</p>;

  return (
    <div className="quiz-container">
      {user && <button className="logout-btn" onClick={onLogout}>Logout</button>}

      {showResult ? (
        <div className="result">
          <h2>Quiz Result</h2>
          <p className="score">Your Score: <strong>{finalScore}</strong> / {questions.length}</p>
          <p className="status" style={{ color: isPass ? "green" : "red" }}>
            {isPass ? "Congratulations! You Passed" : "Sorry, You Failed"}
          </p>
          {isPass && (
            <>
              <button className="certificate-btn" onClick={handleDownloadCertificate}>
                Download Certificate
              </button>
              {certificateLink && (
                <button className="share-btn" onClick={handleShareCertificate}>
                  Share Certificate
                </button>
              )}
            </>
          )}
          <br />
          <button className="retake-btn" onClick={handleRetake}>Retake Quiz</button>
        </div>
      ) : (
        <div>
          <h3>Question {currentIndex + 1} of {questions.length}</h3>
          <p>{questions[currentIndex].question}</p>
          <div>
            {questions[currentIndex].options.map((option) => (
              <div className="option" key={option}>
                <label>
                  <input
                    type="radio"
                    name={`option-${currentIndex}`}
                    value={option}
                    checked={answers[currentIndex] === option}
                    onChange={() => handleOptionChange(option)}
                  />
                  {" "}{option}
                </label>
              </div>
            ))}
          </div>

          <button
            className={`review-btn ${reviewedQuestions[currentIndex] ? "marked" : ""}`}
            onClick={toggleReview}
            style={{ marginTop: "10px" }}
          >
            {reviewedQuestions[currentIndex] ? "Marked for Review" : "Mark for Review"}
          </button>

          {errorMsg && <p className="error-msg" style={{ color: "red", marginTop: "10px" }}>{errorMsg}</p>}

          <div style={{ marginTop: 20 }}>
            <button className="prev-btn" onClick={handlePrevious} disabled={currentIndex === 0}>
              Previous
            </button>
            <button className="next-btn" onClick={handleNext}>
              {currentIndex === questions.length - 1 ? "Submit" : "Next"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
