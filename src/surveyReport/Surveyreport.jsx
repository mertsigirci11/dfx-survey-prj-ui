import { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import "../login.css";
import axios from "axios";
import { redirect } from "react-router-dom";

export default function SurveyReport(){



    return(
        <div>
            <div><span>Survey Report</span> <button>Export PDF</button></div>

        </div>
    );
}