import { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Card } from "primereact/card";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    console.log("Email:", email);
    console.log("Password:", password);

    // burada API isteği atabilirsin
    alert("Login tıklandı!");
  };

  return (
    <div className="flex justify-content-center align-items-center"
         style={{ height: "100vh" }}>
      <Card title="Login" style={{ width: "350px" }}>

        <div className="field">
          <label>Email</label>
          <InputText 
            className="w-full"
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
        </div>

        <div className="field" style={{ marginTop: "1rem" }}>
          <label>Password</label>
          <InputText 
            type="password"
            className="w-full"
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
        </div>

        <Button 
          label="Login" 
          className="w-full mt-3"
          onClick={handleLogin} 
        />

      </Card>
    </div>
  );
}
