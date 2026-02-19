import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { registerUser } from "../services/authApi"; 
import "../styles/register.css";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();

    const response = await registerUser({
      fullname: name,
      email,
      phone,
      password,
    });

    const { status, data } = response;

    if (status === 409) {
      toast.error("User already exists!");
      return;
    }

    if (status === 201) {
      toast.success("Registration successful! Please login.");
      setTimeout(() => navigate("/login"), 800);
      return;
    }

    toast.error(data.message || "Something went wrong!");
  };

  return (
    <div className="register-container">
      <div className="glass-card">
        <h2 className="title">Create Admin Account</h2>

        <form onSubmit={submit}>
          <input
            type="text"
            placeholder="Full Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email Address"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="text"
            placeholder="Phone Number"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" className="btn-primary">
            Register
          </button>

          <p className="switch-text">
            Already have an account?{" "}
            <span onClick={() => navigate("/login")}>Login</span>
          </p>
        </form>
      </div>
    </div>
  );
}
