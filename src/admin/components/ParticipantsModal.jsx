import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { axiosInstance } from "../utils/Axios";

export default function ParticipantsModal({ visible, onHide, surveyId }) {
const [participants, setParticipants] = useState([]);
const [loading, setLoading] = useState(false);
const [newEmail, setNewEmail] = useState("");

// Katılımcıları yükle
const fetchParticipants = async () => {  
    setLoading(true);  
    try {  
        const res = await axiosInstance.get(`/admin/surveys/participants/${surveyId}`);  
        setParticipants(res.data.data || []);  
    } catch (err) {  
        console.error("Participants fetch error:", err);  
    }  
    setLoading(false);  
};  

useEffect(() => {  
    if (visible) fetchParticipants();  
}, [visible]);  

// Yeni katılımcı ekle
const addParticipant = async () => {  
    if (!newEmail) return;  
    try {  
        await axiosInstance.post(`/admin/surveys/participants`, {  
            email: newEmail,  
            id: surveyId  
        });  
        setNewEmail("");  
        fetchParticipants();  
    } catch (err) {  
        console.error("Add participant error:", err);  
    }  
};  

return (  
    <Dialog header="Katılımcılar" visible={visible} onHide={onHide} style={{ width: '400px' }}>  
        <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>  
            <InputText  
                placeholder="Email girin"  
                value={newEmail}  
                onChange={(e) => setNewEmail(e.target.value)}  
            />  
            <Button label="Ekle" onClick={addParticipant} />  
        </div>  

        <div style={{ maxHeight: "200px", overflowY: "auto", border: "1px solid #ccc", borderRadius: "4px", padding: "10px" }}>  
            {loading ? (  
                <p>Yükleniyor...</p>  
            ) : participants.length === 0 ? (  
                <p>Henüz katılımcı yok.</p>  
            ) : (  
                participants.map((email, idx) => (  
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>  
                        <span>{email}</span>  
                        <Button label="Sil" className="p-button-danger p-button-sm" onClick={async () => {  
                            await axiosInstance.delete(`/admin/surveys/participants/${surveyId}/${email}`)  
                            fetchParticipants();  
                        }} />  
                    </div>  
                ))  
            )}  
        </div>  

        <div style={{ textAlign: "right", marginTop: "10px" }}>  
            <Button label="Tamam" onClick={onHide} />  
        </div>  
    </Dialog>  
);  

}
