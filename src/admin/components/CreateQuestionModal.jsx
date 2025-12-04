import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { useState, useEffect } from "react";

export const CreateQuestionModal = ({
    visible,
    onHide,
    onSave,
    mode = "create",         // "create" | "edit"
    initialData = null       // edit modunda gelen data
}) => {

    const QUESTION_TYPES = [
        { label: "Likert", value: "LIKERT" },
        { label: "Free Text", value: "FREETEXT" }
    ];

    const DEFAULT_LIKERT_OPTIONS = ["", "", "", "", ""];

    const [form, setForm] = useState({
        type: "FREETEXT",
        question: "",
        options: []
    });

    // 🔥 Edit modunda formu doldur
    useEffect(() => {
        if (initialData && mode === "edit") {
            setForm({
                type: initialData.type === "FREETEXT" ? "FREETEXT" : "LIKERT",
                question: initialData.question,
                options: initialData.options?.length === 5
                    ? initialData.options
                    : []
            });
        } else if (mode === "create") {
            setForm({
                type: "FREETEXT",
                question: "",
                options: []
            });
        }
    }, [initialData, mode, visible]);

    // Tip değiştiğinde default options yükle
    useEffect(() => {
        if (form.type === "LIKERT") {
            setForm(f => ({ ...f, options: DEFAULT_LIKERT_OPTIONS }));
        } else {
            setForm(f => ({ ...f, options: [] }));
        }
    }, [form.type]);

    const updateOption = (index, val) => {
        const updated = [...form.options];
        updated[index] = val;
        setForm({ ...form, options: updated });
    };

    const handleSave = () => {
        if (!form.question.trim()) {
            alert("Question text cannot be empty!");
            return;
        }

        if (form.type === "LIKERT") {
            for (const opt of form.options) {
                if (!opt.trim()) {
                    alert("All Likert options must be filled!");
                    return;
                }
            }
        }

        const payload = {
            question: form.question,
            type: form.type === "FREETEXT" ? "FREETEXT" : "LIKERT",
            options: form.type === "FREETEXT"
                ? []
                : form.options
        };

        onSave(payload, mode); // mode → PUT mi POST mu belli olsun
        onHide();
    };

    return (
        <Dialog
            header={mode === "edit" ? "Edit Question" : "Create Question"}
            visible={visible}
            onHide={onHide}
            style={{ width: "40vw" }}
        >
            {/* TYPE */}
            <div className="mb-3">
                <label>Type</label>
                <Dropdown
                    className="w-full"
                    value={form.type}
                    options={QUESTION_TYPES}
                    onChange={(e) => setForm({ ...form, type: e.value })}
                />
            </div>

            {/* QUESTION TEXT */}
            <div className="mb-3">
                <label>Question</label>
                <InputText
                    className="w-full"
                    value={form.question}
                    onChange={(e) =>
                        setForm({ ...form, question: e.target.value })
                    }
                />
            </div>

            {/* LIKERT INPUTS */}
            {form.type === "LIKERT" && (
                <div className="mb-3">
                    <label>Likert Options (5 adet)</label>
                    <div className="flex flex-column gap-2 mt-2">
                        {form.options.map((opt, i) => (
                            <InputText
                                key={i}
                                value={opt}
                                onChange={(e) => updateOption(i, e.target.value)}
                                placeholder={`Option ${i + 1}`}
                                className="w-full"
                            />
                        ))}
                    </div>
                </div>
            )}

            <div className="flex justify-end gap-2 mt-4">
                <Button
                    label="Cancel"
                    className="p-button-secondary"
                    onClick={onHide}
                />
                <Button
                    label={mode === "edit" ? "Update" : "Save"}
                    className="p-button-success"
                    onClick={handleSave}
                />
            </div>
        </Dialog>
    );
};
