import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const Register = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    register(name, email, phone);
    navigate("/profile/account");
  };

  return (
    <div className="auth-page">
      <h1>Qeydiyyat</h1>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label htmlFor="name">Ad Soyad</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <label htmlFor="reg-email">E-poçt</label>
        <input
          id="reg-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="phone">Telefon</label>
        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+994 50 123 45 67"
          required
        />

        <button type="submit" className="buy-btn">
          Qeydiyyatdan keç
        </button>
      </form>

      <p className="auth-switch">
        Artıq hesabınız var? <Link to="/login">Giriş edin</Link>
      </p>
    </div>
  );
};

export default Register;
