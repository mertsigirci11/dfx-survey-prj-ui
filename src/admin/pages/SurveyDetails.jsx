import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { axiosInstance } from "../utils/Axios";

import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { CreateQuestionModal } from "../components/CreateQuestionModal";
import ParticipantsModal from "../components/ParticipantsModal";

export default function SurveyDetail() {
    const { id: surveyId } = useParams();

    const [survey, setSurvey] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [createVisible, setCreateVisible] = useState(false);
    const [editVisible, setEditVisible] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [participantsVisible, setParticipantsVisible] = useState(false);

    // -----------------------------------------------------
    // LOAD SURVEY DETAIL
    // -----------------------------------------------------
    const fetchSurveyDetail = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get(`/admin/surveys/${surveyId}`);
            const data = res.data.data;
            setSurvey(data);
            setQuestions(data.questions || []);
        } catch (err) {
            console.error("Survey detail error:", err);
        }
        setLoading(false);
    }, [surveyId]);

    useEffect(() => {
        fetchSurveyDetail();
    }, [fetchSurveyDetail]);

    // -----------------------------------------------------
    // ORDER REORDER DRAG AND DROP
    // -----------------------------------------------------
    const onRowReorder = async (e) => {
        const reordered = e.value;

        // Order değerlerini güncelle (1, 2, 3...)
        reordered.forEach((q, index) => q.order = index + 1);

        setQuestions([...reordered]);

        // backend'e sırayı gönder
        for (const q of reordered) {
            await axiosInstance.put(`/admin/questions/${q.id}`, {
                question: q.question,
                type: q.type,
                order: q.order,
                options: q.options || []
            });
        }
    };

    // -----------------------------------------------------
    // DELETE QUESTION
    // -----------------------------------------------------
    const onDelete = async (qId) => {
        await axiosInstance.delete(`/admin/questions/${qId}`);
        fetchSurveyDetail();
    };

    // -----------------------------------------------------
    // COPY QUESTION
    // -----------------------------------------------------
    const onCopy = async (qId) => {
        await axiosInstance.post(`/admin/questions/${qId}/duplicate`);
        fetchSurveyDetail();
    };

    // -----------------------------------------------------
    // EDIT QUESTION
    // -----------------------------------------------------
    const onEdit = async (qId) => {
        const question = questions.find(q => q.id === qId);
        setSelectedQuestion(question);
        setEditVisible(true);
    };

    // -----------------------------------------------------
    // SAVE SURVEY
    // -----------------------------------------------------
    const onSaveSurvey = async () => {
        const fixedDate = new Date(survey.validUntil);
        fixedDate.setDate(fixedDate.getDate() + 1);

        await axiosInstance.put(`/admin/surveys/${surveyId}`, {
            title: survey.title,
            validUntil: fixedDate
        });
    };

    const onDateChange = async (e) => {
        setSurvey(prev => ({ ...prev, validUntil: e.value }));

        const fixedDate = new Date(e.value);
        fixedDate.setDate(fixedDate.getDate() + 1);

        await axiosInstance.put(`/admin/surveys/${surveyId}`, {
            title: survey.title,
            validUntil: fixedDate
        });
    };

    // Drag handle icon
    const reorderTemplate = () => (
        <i className="pi pi-bars" style={{ cursor: "grab" }}></i>
    );

    const typeTemplate = (row) => {
        const color = row.type === "LIKERT" ? "orange" : "teal";
        return (
            <span
                style={{
                    background: color,
                    padding: "4px 10px",
                    borderRadius: "6px",
                    color: "white",
                    fontSize: "12px"
                }}
            >
                {row.type}
            </span>
        );
    };

    const onAddNewQuestion = async (payload) => {
        const maxOrder = questions.length + 1;

        await axiosInstance.post(`/admin/questions/${surveyId}`, {
            ...payload,
            order: maxOrder
        });

        fetchSurveyDetail();
    };

    const onEditSave = async (payload) => {
        await axiosInstance.put(`/admin/questions/${selectedQuestion.id}`, {
            ...payload,
            order: selectedQuestion.order
        });

        fetchSurveyDetail();
    };

    const actionTemplate = (row) => (
        <div style={{ display: "flex", gap: "6px" }}>
            <Button label="Delete" className="p-button-sm p-button-danger" onClick={() => onDelete(row.id)} />
            <Button label="Edit" className="p-button-sm p-button-warning" onClick={() => onEdit(row.id)} />
            <Button label="Copy" className="p-button-sm p-button-secondary" onClick={() => onCopy(row.id)} />
        </div>
    );

    if (!survey) return "Loading...";

    return (
        <div style={{ padding: 20 }}>
            <h2>Anket Oluşturma</h2>

            {/* HEADER */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px", alignItems: "center" }}>

                {/* EXPIRE DATE */}
                <div>
                    <label>Expire Date</label>
                    <Calendar
                        value={new Date(survey.validUntil)}
                        onChange={onDateChange}
                        dateFormat="dd.mm.yy"
                    />
                </div>

                <Button label="Katılımcılar" className="p-button-secondary" onClick={() => setParticipantsVisible(true)} />
                <Button label="+Yeni" className="p-button-primary" onClick={() => setCreateVisible(true)} />
            </div>

            {/* QUESTIONS TABLE */}
            <DataTable
                value={questions}
                loading={loading}
                reorderableRows
                onRowReorder={onRowReorder}
                rowHover
                tableStyle={{ minWidth: "70rem" }}
            >
                <Column rowReorder body={reorderTemplate} style={{ width: "3rem" }} />

                <Column
                    header="#"
                    body={(row, opt) => opt.rowIndex + 1}
                    style={{ width: "3rem" }}
                />

                <Column field="question" header="Soru" />

                <Column header="Tip" body={typeTemplate} style={{ width: "8rem" }} />

                <Column header="Aksiyon" body={actionTemplate} style={{ width: "14rem" }} />
            </DataTable>
            <CreateQuestionModal
                visible={createVisible}
                mode="create"
                onHide={() => setCreateVisible(false)}
                onSave={onAddNewQuestion}
            />

            <CreateQuestionModal
                visible={editVisible}
                mode="edit"
                initialData={selectedQuestion}
                onHide={() => setEditVisible(false)}
                onSave={onEditSave}
            />

            <ParticipantsModal
                visible={participantsVisible}
                onHide={() => setParticipantsVisible(false)}
                surveyId={surveyId}
            />
        </div>
    );
}
