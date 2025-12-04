import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { ProgressBar } from 'primereact/progressbar';
import { Messages } from 'primereact/messages';
import { ProgressSpinner } from 'primereact/progressspinner'; 

// --- Configuration ---
// !!! IMPORTANT: Replace this with the actual JWT token from your login process !!!
const JWT_TOKEN = "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ4em1kcjlaMXoyTGdYekdzXzJDUW90RVZrbXpRNFFDTGZydmhOVEpzQUhJIn0.eyJleHAiOjE3NjQ4NDgxNTIsImlhdCI6MTc2NDg0NzI1MiwianRpIjoib25ydHJvOjFiNTQ2N2JmLWMwNDktN2I3Yy1hYTAwLWFjMDM1Mzk4MzQ4OCIsImlzcyI6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4MC9yZWFsbXMvbWFzdGVyIiwiYXVkIjoiYWNjb3VudCIsInN1YiI6IjhkOWYyMzU4LTIxNGQtNDU3ZS1iNmYwLTkyNTIyZTdlNWM3OCIsInR5cCI6IkJlYXJlciIsImF6cCI6ImRmeC1zdXJ2ZXkiLCJzaWQiOiJjNTExZWUyYy00MDc3LTQ0M2UtN2UwYi1mMDA0NTk4OGQzYjMiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbIi8qIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJkZWZhdWx0LXJvbGVzLW1hc3RlciIsIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6ImVtYWlsIHByb2ZpbGUiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicHJlZmVycmVkX3VzZXJuYW1lIjoiYXJkYSIsImVtYWlsIjoiYWJ1cmFra29udGFzQGhvdG1haWwuY29tIn0.wNR9kppfrLqbKVAWbFplMBx9CgAk-lEJB84t5UR2fFa-hOjXmGMOTrHyGRvtnczCx5yvwPE1yld4J2zsZYr0oK6O2Vd1M0qg-ToQwBAC7FSIZLQc-BPkrolxsGivL9fCHeR-xVMeg21sJofas1ttFhK9dAH2HQ_04gYmD17s7pR86qBPaEP6k-tfJPiL1I7u8ofKgigeU_vr-n0mTRgNwxn55_hQ6vB83DmISRllI9Esvg8Lzs7tqTdfV-AgUV6NiWo-8vfCP2s1kDBWFf9bhEAwzsaZmidbKLt2EKe3mYerUEJUpXUR45eanI2c1R3NeGjo6GhKE3LVgFmcByBP9g"; 
const BASE_URL = "http://192.168.1.48:8081";

// Assuming this endpoint returns a list of all survey questions wrapped in 'data'
const API_URL_QUESTIONS_LIST = `${BASE_URL}/admin/questions`; 
const API_URL_SUBMIT = `${BASE_BASE_URL}/admin/answers`; 
// ---------------------

/**
 * Maps string options from the backend (e.g., "Strongly Dislike") 
 * to the required frontend object format ({ value: number, label: string }).
 * Assumes a 5-point scale where the options array starts with the lowest value
 * (1) and ends with the highest value (5).
 */
const mapOptionsToLikert = (backendOptions) => {
    // We map them to values 1, 2, 3, 4, 5 sequentially based on the array index.
    const startingValue = 1;
    
    return backendOptions.map((label, index) => {
        return {
            // Value is derived sequentially based on index
            value: startingValue + index,
            label: label 
        };
    });
};

export default function Survey() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  
  const messagesRef = useRef(null);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [message, setMessage] = useState(null); 

  const totalSteps = questions.length;
  // Safely get the current question. This variable is null if questions is empty.
  const currentQuestion = questions[currentStep];

  // Effect to display transient messages using the PrimeReact Messages component
  useEffect(() => {
    if (message && messagesRef.current) {
        messagesRef.current.show(message);
        const timer = setTimeout(() => setMessage(null), 5000); 
        return () => clearTimeout(timer);
    }
  }, [message]);


  // --- Data Fetching Effect with Authorization and Data Mapping ---
  useEffect(() => {
    const fetchQuestions = async () => {
      console.log(`[DEBUG] Attempting to fetch questions from: ${API_URL_QUESTIONS_LIST}`);
      try {
        setLoading(true);
        
        const response = await axios.get(API_URL_QUESTIONS_LIST, {
            headers: {
                'Authorization': `Bearer ${JWT_TOKEN}`,
            }
        }); 
        
        console.log("[DEBUG] Raw API Response:", response.data);

        // 1. Extract the actual question list from response.data.data
        const rawQuestionData = response.data?.data;
        
        if (!Array.isArray(rawQuestionData)) {
            throw new Error(`API returned invalid data structure. Expected 'data' property to be an array. Received type: ${typeof rawQuestionData}`);
        }
        
        // 2. Map the raw data to the frontend structure
        const mappedQuestions = rawQuestionData.map(q => ({
            id: q.id,
            text: q.question, // Map 'question' field to 'text'
            type: q.type,
            order: q.order,
            // Map the backend string options to the required object array
            options: mapOptionsToLikert(q.options || []) 
        }));

        if (mappedQuestions.length > 0) {
            // Sort by order field to ensure correct survey sequence
            mappedQuestions.sort((a, b) => a.order - b.order); 
            setQuestions(mappedQuestions); 
        } else {
            console.warn("[DEBUG] API returned an empty array of questions.");
            setQuestions([]);
        }

        setFetchError(null);
        
      } catch (error) {
        console.error("--- FETCH ERROR DETAILS ---");
        console.error("Full Error Object:", error);

        let errorDetails = {
            summary: "Sorular Yüklenemedi (API Hatası)",
            detail: error.message,
            technical: null
        };
        if (error.response) {
            errorDetails.summary = `Sunucu Hatası (${error.response.status})`;
            // Attempt to get a detailed message from the server response body
            errorDetails.detail = error.response.data?.message || `Sunucudan ${error.response.status} hata kodu alındı.`;
            errorDetails.technical = JSON.stringify(error.response.data, null, 2);
        } else if (error.request) {
            errorDetails.summary = "Ağ Hatası / Sunucu Kapalı";
            errorDetails.detail = "Sunucuya ulaşılamıyor. API adresini veya ağ bağlantınızı kontrol edin.";
            errorDetails.technical = error.message;
        } 
        
        setFetchError(errorDetails);
        
      } finally {
        setLoading(false);
      }
    };

    // Prevent fetching if the placeholder token is still in use
    if (JWT_TOKEN && JWT_TOKEN !== "YOUR_AUTH_TOKEN_FROM_LOGIN") {
        fetchQuestions();
    } else {
        setLoading(false);
        setFetchError({
            summary: "Yetkilendirme Hatası",
            detail: "Lütfen JWT_TOKEN sabitini geçerli bir belirteçle güncelleyin.",
            technical: "Token is missing or is the default placeholder."
        });
    }
    
  }, []); 
  // ----------------------------------------

  const progress = totalSteps > 0 ? ((currentStep) / totalSteps) * 100 : 0; 
  
  const handleAnswerChange = (questionId, value) => {
    setAnswers({
      ...answers,
      [questionId]: value,
    });
  };

  const handleNext = () => {
    if (!currentQuestion) return; 

    // Validation
    if (!answers[currentQuestion.id]) {
      setMessage({ severity: 'error', summary: 'Hata', detail: 'Lütfen bir seçim yapınız.', sticky: false });
      return;
    }
    
    // Move to next question or submit
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
      setMessage(null); 
    } else {
      handleSubmitAnswers();
    }
  };

  const handleSubmitAnswers = async () => {
    setLoading(true); 

    // Transform answers object into the format expected by your backend
    const submissionData = Object.entries(answers).map(([questionId, value]) => ({
        questionId: questionId,
        answerValue: value 
    }));

    try {
      await axios.post(API_URL_SUBMIT, submissionData, {
        headers: {
            'Authorization': `Bearer ${JWT_TOKEN}`,
        }
      });

      setMessage({ severity: 'success', summary: 'Başarılı', detail: 'Anketiniz başarıyla gönderildi!', sticky: true });
      
    } catch (error) {
      console.error("--- SUBMISSION ERROR DETAILS ---");
      console.error("Submission Error:", error);
      const errorMessage = error.response?.data?.message || 'Anket gönderilirken beklenmeyen bir sorun oluştu.';
      setMessage({ severity: 'error', summary: 'Hata', detail: errorMessage, sticky: true });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setMessage(null); 
    }
  };

  // Safe rendering of options using optional chaining
  const renderOptions = (question) => (
    <div className="flex flex-column gap-2">
      {question?.options?.map((option) => (
        <div key={option.value} className="flex align-items-center">
          <input
            type="radio"
            id={`q${question.id}-opt${option.value}`}
            name={`question-${question.id}`}
            value={option.value}
            checked={answers[question.id] === option.value}
            onChange={() => handleAnswerChange(question.id, option.value)}
            className="mr-2"
          />
          {/* Use option.label for display */}
          <label htmlFor={`q${question.id}-opt${option.label}`}>{option.label}</label>
        </div>
      ))}
    </div>
  );

  // --- Conditional Rendering for Loading/Error States ---
  if (loading && totalSteps === 0) {
    return (
      <div className="flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <ProgressSpinner />
        <p className="ml-3">Sorular yükleniyor...</p>
      </div>
    );
  }

  // Display detailed error screen if fetchError occurred
  if (fetchError) {
    return (
      <div className="flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <Card title={fetchError.summary} style={{ width: "500px" }} className="shadow-6">
            <Messages severity="error" detail={fetchError.detail} className="mb-3" />
            
            {fetchError.technical && (
                <div className="p-3 bg-red-100 border-round">
                    <h4 className="text-red-700 mt-0">Teknik Hata Detayı</h4>
                    <pre className="text-sm overflow-auto max-h-15rem">
                        {typeof fetchError.technical === 'string' 
                            ? fetchError.technical 
                            : JSON.stringify(fetchError.technical, null, 2)}
                    </pre>
                </div>
            )}
        </Card>
      </div>
    );
  }

  if (totalSteps === 0) {
    return (
      <div className="flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <Card title="Bilgi" style={{ width: "500px" }} className="shadow-6">
            <Messages severity="info" detail="Şu anda görüntülenecek aktif bir anket bulunmamaktadır." />
        </Card>
      </div>
    );
  }

  // --- Main Survey Render ---
  return (
    <div className="flex justify-content-center align-items-center" style={{ height: "100vh" }}>
      <Card title="Eğitim Anketi" style={{ width: "500px" }} className="shadow-6">
        
        {/* Progress Bar */}
        <div className="mb-4">
          <ProgressBar value={progress} showValue={false} style={{ height: '6px' }} />
        </div>

        {/* Error/Message Display */}
        <Messages ref={messagesRef} className="mb-3" />
        
        {/* Only render question details if currentQuestion is successfully loaded */}
        {currentQuestion ? (
            <>
                <div className="p-4 border-round-md surface-200">
                    <p className="font-semibold mb-3">{currentQuestion.text}</p> 
                    {renderOptions(currentQuestion)}
                </div>

                {/* Footer and Buttons */}
                <div className="mt-4 flex justify-content-between">
                
                    {/* Back Button */}
                    <Button 
                        label="Geri" 
                        icon="pi pi-arrow-left" 
                        onClick={handleBack} 
                        disabled={currentStep === 0 || loading}
                        className="p-button-secondary"
                    />
                    
                    {/* Next/Finish Button */}
                    <Button 
                        label={currentStep === totalSteps - 1 ? "Gönder" : "İleri"} 
                        iconPos="right"
                        icon={currentStep === totalSteps - 1 ? "pi pi-check" : "pi pi-arrow-right"} 
                        onClick={handleNext} 
                        disabled={loading}
                        className="p-button-primary"
                    />
                </div>
                
                {/* Note from your design */}
                {currentStep === 0 && (
                    <p className="mt-3 text-sm text-color-secondary">* Bu soruyu cevaplayana kadar görünmeyecek</p>
                )}
            </>
        ) : (
            <div className="p-4 text-center">
                <p>Sorular hazırlanıyor...</p>
            </div>
        )}

      </Card>
    </div>
  );
}