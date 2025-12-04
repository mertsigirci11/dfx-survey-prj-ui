import React from "react";

export default function ThankYouPage() {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.checkIcon}>
          <span role="img" aria-label="success">✔️</span>
        </div>
        <h2 style={styles.successMessage}>Teşekkür ederiz!</h2>
        <p>Gönderiminiz başarıyla alındı. Yardımcı olabileceğimiz başka bir şey var mı?</p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#f4f4f4",
  },
  card: {
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
    fontSize: "24px",
    color: "#333",
    fontWeight: "600",
  },
};
