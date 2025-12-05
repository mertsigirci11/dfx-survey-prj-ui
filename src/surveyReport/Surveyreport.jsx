import { useEffect, useState } from "react";
import { Button } from "primereact/button";
import "../report.css";
import { axiosInstance } from "../admin/utils/Axios";
import { useParams } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function SurveyReport() {
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(true);

    const { id: surveyId } = useParams();

    useEffect(() => {
        fetchReport();
    }, []);

    const exportPdf = async () => {
        const element = document.getElementById("report-content");

        if (!element) {
            alert("Rapor içeriği bulunamadı!");
            return;
        }

        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true
        });

        const imgData = canvas.toDataURL("image/png");

        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

        pdf.save("survey-report.pdf");
    };

    const fetchReport = async () => {
        try {
            const response = await axiosInstance.get(
                `/admin/surveys/report/${surveyId}`
            );

            console.log("Report:", response.data);

            setReportData(response.data.data.questions);
            setLoading(false);

        } catch (err) {
            console.error(err);
            alert("Rapor verileri alınamadı!");
            setLoading(false);
        }
    };

    if (loading) return <div style={{ padding: 30 }}>Loading...</div>;

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
            <div className="report-content" id="report-content">

                {reportData.map((q) => (
                    <div className="question-block" key={q.questionId}>

                        {/* SORU BAŞLIĞI */}
                        <h3 className="question-title">
                            {q.questionText}
                        </h3>

                        {/* --------------------------------------------- */}
                        {/* FREETEXT SORULAR */}
                        {/* --------------------------------------------- */}
                        {q.type === "FREETEXT" && (
                            <div className="freetext-list">
                                {q.answers.length === 0 ? (
                                    <p style={{ fontStyle: "italic", color: "#666" }}>
                                        Bu soruya henüz cevap verilmemiş.
                                    </p>
                                ) : (
                                    q.answers.map((ans, i) => (
                                        <div className="freetext-item" key={i}>
                                            {ans}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* --------------------------------------------- */}
                        {/* YÜZDELİ SORULAR */}
                        {/* --------------------------------------------- */}
                        {q.type !== "FREETEXT" &&
                            q.optionPercentages.map((opt, i) => (
                                <div className="option-row" key={i}>

                                    <div className="option-text">{opt.optionText}</div>

                                    <div className="option-bar-wrapper">
                                        <div
                                            className="option-bar"
                                            style={{
                                                width: opt.percent + "%",
                                                background: opt.percent > 0 ? "#4caf50" : "#ccc"
                                            }}
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
