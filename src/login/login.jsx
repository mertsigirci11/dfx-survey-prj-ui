import { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import "../login.css";
import axios from "axios";
import { redirect, useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();   // 👈 HOOK

  const handleLogin = async () => {
    try{
      localStorage.removeItem("token");
      const response = await axios.post(
        "http://192.168.1.48:8081/login",
        {
          email: email,
          password: password
        },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
      var localStorageTokenItem = {
        "token": response.data.data.accessToken,
        "refreshToken": response.data.data.refreshToken
      }
      localStorage.setItem("token", JSON.stringify(localStorageTokenItem));
      navigate("/admin/survey");
    }catch(err){
      alert("HATA: "+ err);
    }
  };

  return (
    <div className="login-wrapper">
      <Card title="Login" className="login-card">
        <div className="field">
          <label>Email</label>
          <br />
          <InputText
            className="w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="field">
          <label>Password</label>
          <br />
          <InputText
            type="password"
            className="w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <Button
          label="Login"
          className="login-btn"
          onClick={handleLogin}
        />
      </Card>
    </div>
  );
}
