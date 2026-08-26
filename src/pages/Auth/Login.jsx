import { useState, useContext } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const Login = () => {
  const { login, error } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const success = await login(email);
    setSubmitting(false);
    if (success) {
      
      navigate(location.state?.from || "/profile/account");
    }
  };

  return (
    <div className="auth-page">
      <h1>Giriş</h1>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label htmlFor="email">E-poçt</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" className="buy-btn" disabled={submitting}>
          {submitting ? "Yoxlanılır..." : "Giriş et"}
        </button>
      </form>

      <p className="auth-switch">
        Hesabınız yoxdur? <Link to="/register">Qeydiyyatdan keçin</Link>
      </p>
    </div>
  );
};

export default Login;
