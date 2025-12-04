import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";  // useNavigate for redirection
import axios from "axios";

export default function SurveyRunner() {
  const { token } = useParams(); // participant token
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // Store answers temporarily in state
  const [submitted, setSubmitted] = useState(false); // Track submission status
  const [surveyCompleted, setSurveyCompleted] = useState(false); // Track if the survey is completed

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        // Fetch question summaries by participant token
        const resSummary = await axios.get(`http://192.168.1.48:8081/survey/${token}`);

        // If the survey is already completed, handle it
        if (resSummary.data?.code === "400" && resSummary.data?.error === "You already completed this survey") {
          setSurveyCompleted(true);
          setLoading(false);  // No need to load questions if survey is completed
          return;  // Stop further processing
        }

        const questionSummaries = resSummary.data?.data?.questions || [];

        if (questionSummaries.length === 0) {
          setLoading(false);
          return;
        }

        // Fetch full question details
        const detailedQuestions = await Promise.all(
          questionSummaries.map(async (q) => {
            try {
              const resDetail = await axios.get(`http://192.168.1.48:8081/admin/questions/${q.id}`);
              return resDetail.data?.data || q; // Fallback to summary if detail fails
            } catch (err) {
              return q;
            }
          })
        );

        detailedQuestions.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

        setQuestions(detailedQuestions);
        
        // Set initial answers from backend data
        const initialAnswers = questionSummaries.reduce((acc, question) => {
          acc[question.id] = question.answer || null; // Prepopulate answers
          return acc;
        }, {});
        setAnswers(initialAnswers);
        
      } catch (err) {
        console.error("Error fetching survey questions:", err);
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [token]);

  const handleOptionChange = (value) => {
    setAnswers((prev) => ({
      ...prev,
      [questions[currentIndex]?.id]: value, // Only access the question if it exists
    }));
  };

  const handleTextChange = (value) => {
    setAnswers((prev) => ({
      ...prev,
      [questions[currentIndex]?.id]: value, // Only access the question if it exists
    }));
  };

  const next = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const back = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const skip = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
  };

  // Save answers to DB only when the "Save Draft" or "Submit" button is clicked
  const saveAnswerToDB = async () => {
    try {
      const payload = Object.entries(answers).map(([questionId, answer]) => ({
        participantToken: token,
        questionId,
        answer,
      }));

      // Send answers to DB
      await axios.post("http://192.168.1.48:8081/survey/answers", payload);
    } catch (err) {
      console.error("Error saving answer to DB:", err);
    }
  };

  const submitSurvey = async () => {
    try {
      // Save all answers to the DB
      await saveAnswerToDB();

      // Mark the survey as completed
      await completeSurvey();

      setSubmitted(true); // Set submitted to true when successful
    } catch (err) {
      console.error("Survey submit error:", err);
      alert("Beklenmeyen bir hata oluştu.");
    }
  };

  const completeSurvey = async () => {
    try {
      await axios.post(`http://192.168.1.48:8081/survey/${token}/complete`);
      navigate("/thank-you"); // Redirect to a Thank You page or elsewhere after completing the survey
    } catch (err) {
      console.error("Error completing the survey:", err);
      alert("Anket tamamlanırken bir hata oluştu.");
    }
  };

  const saveDraft = () => {
    // Save the answers in the browser's localStorage as a draft
    localStorage.setItem(`surveyDraft_${token}`, JSON.stringify(answers));
    alert("Taslak kaydedildi!");
  };

  if (surveyCompleted) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2>Bu anketi zaten tamamladınız</h2>
          <p>Bu ankete zaten cevap verdiniz. Anket tamamlanmıştır.</p>
        </div>
      </div>
    );
  }

  if (loading) return <div style={{ padding: 20 }}>Yükleniyor...</div>;

  if (submitted) {
    // Success screen after submission
    return (
      <div style={styles.successContainer}>
        <div style={styles.successCard}>
          <div style={styles.checkIcon}>
            <span role="img" aria-label="success">✔️</span>
          </div>
          <p style={styles.successMessage}>Cevaplarınız başarıyla gönderildi.</p>
        </div>
      </div>
    );
  }

  const q = questions[currentIndex]; // Current question
  if (!q) return <div style={{ padding: 20 }}>Soru bulunamadı.</div>; // Add a safety check in case q is undefined

  const total = questions.length;

  return (
    <div style={styles.container}>
      <h2>Eğitim Anketi</h2>

      <div style={styles.progressWrapper}>
        <div
          style={{
            ...styles.progressBar,
            width: `${((currentIndex + 1) / total) * 100}%`,
          }}
        ></div>
      </div>

      <div style={styles.card}>
        <div style={styles.counter}>
          Soru {currentIndex + 1} / {total}
        </div>

        <h4>{q.question}</h4>

        {/* Handle different question types */}
        <div style={{ marginTop: 15 }}>
          {q.type === "LIKERT" && q.options && q.options.length > 0 ? (
            q.options.map((opt, idx) => (
              <label key={idx} style={styles.option}>
                <input
                  type="radio"
                  name={q.id}
                  value={opt}
                  checked={answers[q.id] === opt}  // Check if the answer matches
                  onChange={() => handleOptionChange(opt)}
                />
                {opt}
              </label>
            ))
          ) : q.type === "FREETEXT" ? (
            <textarea
              rows="4"
              value={answers[q.id] || ""} // Use the answer from the backend if available
              onChange={(e) => handleTextChange(e.target.value)}
              style={{ width: "100%", padding: "10px", fontSize: "16px" }}
              placeholder="Cevabınızı buraya yazın"
            />
          ) : (
            <em>Geçersiz soru türü.</em>
          )}
        </div>

        <div style={styles.btnRow}>
          {currentIndex > 0 && (
            <button style={styles.btnBack} onClick={back}>
              Geri
            </button>
          )}

          {currentIndex < total - 1 ? (
            <>
              <button style={styles.btnSkip} onClick={skip}>
                Atla
              </button>
              <button style={styles.btnNext} onClick={next}>
                İleri
              </button>
            </>
          ) : (
            <button style={styles.btnSubmit} onClick={submitSurvey}>
              Gönder
            </button>
          )}
        </div>

        <div style={{ marginTop: "15px" }}>
          <button style={styles.btnSave} onClick={saveDraft}>
            Taslak Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 720,
    margin: "0 auto",
    padding: 30,
    fontFamily: "sans-serif",
  },
  progressWrapper: {
    width: "100%",
    height: 8,
    background: "#ddd",
    borderRadius: 4,
    marginBottom: 20,
  },
  progressBar: {
    height: "100%",
    background: "#121212",
    borderRadius: 4,
    transition: "0.3s ease",
  },
  card: {
    padding: 25,
    borderRadius: 10,
    background: "#fff",
    border: "1px solid #ccc",
  },
  counter: {
    opacity: 0.6,
    marginBottom: 10,
  },
  option: {
    display: "block",
    marginBottom: 10,
    cursor: "pointer",
  },
  btnRow: {
    marginTop: 25,
    display: "flex",
    justifyContent: "space-between",
  },
  btnBack: {
    padding: "8px 16px",
    background: "#aaa",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
  btnSkip: {
    padding: "8px 16px",
    background: "#777",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
  btnNext: {
    padding: "8px 16px",
    background: "#1f6bff",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
  btnSubmit: {
    padding: "8px 16px",
    background: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    marginLeft: "auto",
  },
  btnSave: {
    padding: "8px 16px",
    background: "#FFB830",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
  successContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#f4f4f4",
  },
  successCard: {
    textAlign: "center",
    padding: "30px",
    background: "#fff",
    borderRadius: "10px",
    boxShadow: "0 0 15px rgba(0, 0, 0, 0.1)",
  },
  checkIcon: {
    fontSize: "40px",
    color: "#28a745",
    marginBottom: "20px",
  },
  successMessage: {
    fontSize: "20px",
    color: "#333",
    fontWeight: "600",
  },
};
