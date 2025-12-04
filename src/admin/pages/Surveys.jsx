import { useEffect, useState, useCallback } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { axiosInstance } from "../utils/Axios";
import { useNavigate } from "react-router-dom";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";

export default function Surveys() {
    const [surveys, setSurveys] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [first, setFirst] = useState(0);
    const rows = 10;
    const [totalRecords, setTotalRecords] = useState(0);

    // 🔹 Modal state
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [newSurveyTitle, setNewSurveyTitle] = useState("");
    const [newSurveyValidUntil, setNewSurveyValidUntil] = useState("");

    // 🔹 async fetchSurveys
    const fetchSurveys = useCallback(async (pageNumber = 0) => {
        setLoading(true);
        try {
            const res = await axiosInstance.get(
                `/admin/surveys/list?pageNumber=${pageNumber}`
            );
            const newData = res.data.data.surveys || [];
            const totalElements = res.data.data.totalElements;
            setTotalRecords(totalElements);
            setSurveys(newData);
        } catch (err) {
            console.error("Survey fetch error:", err);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        const pageNumber = first / rows;
        fetchSurveys(pageNumber);
    }, [first, fetchSurveys]);

    const dateTemplate = (row) => {
        if (row.expireDate == null) return "-";
        return new Date(row.expireDate).toLocaleDateString("tr-TR");
    };

    const onCopyClick = async (surveyId) => {
        try {
            const res = await axiosInstance.post(`/admin/surveys/${surveyId}/duplicate`);
            if (res?.data?.success) {
                setTotalRecords(prev => prev + 1);
                const currentPage = first / rows;
                await fetchSurveys(currentPage);
            }
        } catch (err) {
            console.error("Survey duplicate error:", err);
        }
    };

    const onSendClick = async (surveyId) => {
        try {
            const res = await axiosInstance.post(`/admin/surveys/${surveyId}/send`);
            if (res?.data?.success) {
                alert("Anket gönderildi!");
            }
        } catch (err) {
            console.error("Survey send error:", err);
        }
    };

    const onEditClick = (surveyId) => {
        navigate(`/admin/survey/${surveyId}`);
    };

    const onResultClick = (surveyId) => {
        navigate(`/admin/survey/report/${surveyId}`)
    }

    const actionTemplate = (row) => (
        <div style={{ display: "flex", gap: "6px" }}>
            <Button label="Kopyala" disabled={row.status != "CREATED"} onClick={() => onCopyClick(row.id)} className="p-button-sm p-button-secondary" />
            <Button label="Sonuçlar" disabled={row.status == "CREATED"} onClick={() => onResultClick(row.id)} className="p-button-sm p-button-help" />
            <Button label="Gönder" disabled={row.status != "CREATED"} onClick={() => onSendClick(row.id)} className="p-button-sm p-button-success" />
            <Button label="Düzenle" disabled={row.status != "CREATED"} onClick={() => onEditClick(row.id)} className="p-button-sm p-button-warning" />
            <Button label="Sil" onClick={() => onDeleteClick(row.id)} className="p-button-sm p-button-danger" />
        </div>
    );

    const onPageChange = (event) => {
        setFirst(event.first);
    };

    // 🔹 Yeni Anket Kaydet
    const handleCreateSurvey = async () => {
        if (!newSurveyTitle.trim() || !newSurveyValidUntil) {
            alert("Lütfen başlık ve bitiş tarihi girin!");
            return;
        }

        try {
            const res = await axiosInstance.post(`/admin/surveys`, {
                title: newSurveyTitle,
                validUntil: newSurveyValidUntil
            });

            if (res?.data?.success) {
                setCreateModalVisible(false);
                setNewSurveyTitle("");
                setNewSurveyValidUntil("");
                fetchSurveys(first / rows); // listeyi yenile
            }
        } catch (err) {
            console.error("Survey creation error:", err);
        }
    };

    const onDeleteClick = async (surveyId) => {
        if (!window.confirm("Bu anketi silmek istediğinizden emin misiniz?")) return;

        try {
            await axiosInstance.delete(`/admin/surveys/${surveyId}`);
            // Kayıt silindikten sonra sayfayı yenile
            const currentPage = first / rows;
            fetchSurveys(currentPage);
        } catch (err) {
            console.error("Survey delete error:", err);
        }
    };

    const statusTemplate = (row) => {
        const statusColors = {
            CREATED: "gray",
            SENT: "blue",
            COMPLETED: "green"
        };
        return (
            <span
                style={{
                    color: "white",
                    backgroundColor: statusColors[row.status] || "black",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontSize: "12px"
                }}
            >
                {row.status}
            </span>
        );
    }

    return (
        <div style={{ padding: "20px" }}>
            <h2>Anketlerim</h2>

            <Button
                label="Yeni"
                className="p-button-success"
                style={{ marginBottom: "15px" }}
                onClick={() => setCreateModalVisible(true)}
            />

            <DataTable
                value={surveys}
                loading={loading}
                stripedRows
                paginator
                lazy
                rows={rows}
                first={first}
                totalRecords={totalRecords}
                onPage={onPageChange}
                tableStyle={{ minWidth: "50rem" }}
            >
                <Column header="#" body={(row, options) => options.rowIndex + 1} />
                <Column field="title" header="Anket" />
                <Column header="Bitiş" body={dateTemplate} />
                <Column field="participantCount" header="Katılımcı Sayısı" />
                <Column field="status" header="Durum" body={statusTemplate} />
                <Column header="Aksiyonlar" body={actionTemplate} />
            </DataTable>

            {/* 🔹 Create Survey Modal */}
            <Dialog
                header="Yeni Anket"
                visible={createModalVisible}
                onHide={() => setCreateModalVisible(false)}
                style={{ width: "30vw" }}
            >
                <div className="mb-3">
                    <label>Başlık</label>
                    <InputText
                        className="w-full"
                        value={newSurveyTitle}
                        onChange={(e) => setNewSurveyTitle(e.target.value)}
                    />
                </div>

                <div className="mb-3">
                    <label>Bitiş Tarihi</label>
                    <Calendar
                        className="w-full"
                        value={newSurveyValidUntil ? new Date(newSurveyValidUntil) : null}
                        onChange={(e) => setNewSurveyValidUntil(e.value)}
                        dateFormat="dd.mm.yy"
                    />
                </div>

                <div className="flex justify-end gap-2 mt-4">
                    <Button
                        label="İptal"
                        className="p-button-secondary"
                        onClick={() => setCreateModalVisible(false)}
                    />
                    <Button
                        label="Kaydet"
                        className="p-button-success"
                        onClick={handleCreateSurvey}
                    />
                </div>
            </Dialog>
        </div>
    );
}
