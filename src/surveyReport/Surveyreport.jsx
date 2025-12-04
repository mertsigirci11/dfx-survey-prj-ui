import { Button } from "primereact/button";
import "../report.css";

export default function SurveyReport() {
  // örnek data (backend’den gelecek)
  const surveyResults = [
    {
      question: "1. Uygulamayı genel olarak nasıl değerlendirirsiniz?",
      options: [
        { text: "Çok iyi", percent: 40 },
        { text: "İyi", percent: 35 },
        { text: "Orta", percent: 20 },
        { text: "Kötü", percent: 5 }
      ]
    },
    {
      question: "2. Tasarım kolay anlaşılır mıydı?",
      options: [
        { text: "Evet", percent: 70 },
        { text: "Hayır", percent: 30 }
      ]
    }
  ];

  const exportPdf = () => {
    alert("PDF export edilecek (sonra ekleriz).");
  };

  return (
    <div className="report-container">

      {/* HEADER */}
      <div className="report-header">
        <h2>Survey Report</h2>
        <Button
          label="Export PDF"
          icon="pi pi-file-pdf"
          className="p-button-danger"
          onClick={exportPdf}
        />
      </div>

      {/* CONTENT */}
      <div className="report-content">
        {surveyResults.map((q, index) => (
          <div className="question-block" key={index}>
            <h3 className="question-title">{q.question}</h3>

            {q.options.map((opt, i) => (
              <div className="option-row" key={i}>
                <div className="option-text">{opt.text}</div>
                <div className="option-bar-wrapper">
                  <div
                    className="option-bar"
                    style={{ width: opt.percent + "%" }}
                  ></div>
                </div>
                <div className="option-percent">{opt.percent}%</div>
              </div>
            ))}
          </div>
        ))}
      </div>

    </div>
  );
}
