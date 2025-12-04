import { useEffect, useState, useCallback } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { axiosInstance } from "../utils/Axios";

export default function Surveys() {
    const [surveys, setSurveys] = useState([]);
    const [loading, setLoading] = useState(false);

    const [first, setFirst] = useState(0);   // PrimeReact için
    const rows = 10;

    const [totalRecords, setTotalRecords] = useState(0);

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

            setSurveys(newData); // sadece o sayfanın datasını gösteriyoruz

        } catch (err) {
            console.error("Survey fetch error:", err);
        }

        setLoading(false);
    }, []);

    // PAGE değişince backend’den çek
    useEffect(() => {
        const pageNumber = first / rows;
        fetchSurveys(pageNumber);
    }, [first, fetchSurveys]);

    const dateTemplate = (row) => {
        if (row.expireDate == null) return "-";
        return new Date(row.expireDate).toLocaleDateString("tr-TR");
    };

    // 🔹 Kopyalama işlemi
    const onCopyClick = async (surveyId) => {
        try {
            const res = await axiosInstance.post(`/admin/surveys/${surveyId}/duplicate`);

            if (res?.data?.success) {
                // Toplam kayıt sayısı +1
                setTotalRecords(prev => prev + 1);

                // Şu anki backend pageNumber
                const currentPage = first / rows;

                // Sayfayı yeniden yükle
                await fetchSurveys(currentPage);
            }

        } catch (err) {
            console.error("Survey duplicate error:", err);
        }
    };

    const actionTemplate = (row) => (
        <div style={{ display: "flex", gap: "6px" }}>
            <Button label="Kopyala" onClick={() => onCopyClick(row.id)} className="p-button-sm p-button-secondary" />
            <Button label="Sonuçlar" className="p-button-sm p-button-help" />
            <Button label="Gönder" className="p-button-sm p-button-success" />
            <Button label="Düzenle" className="p-button-sm p-button-warning" />
        </div>
    );

    // 🔹 Pagination Event
    const onPageChange = (event) => {
        setFirst(event.first);
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>Anketlerim</h2>

            <Button
                label="+ Yeni"
                className="p-button-success"
                style={{ marginBottom: "15px" }}
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
                <Column header="Aksiyonlar" body={actionTemplate} />
            </DataTable>
        </div>
    );
}
