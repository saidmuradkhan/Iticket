import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { AuthContext } from "../../context/AuthContext";
import { FlagAzIcon } from "../Header/HeaderIcons";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M19.6 10.23c0-.68-.06-1.36-.18-2.02H10v3.82h5.4a4.62 4.62 0 0 1-2 3.03v2.5h3.23c1.89-1.74 2.97-4.3 2.97-7.33Z"
    />
    <path
      fill="#34A853"
      d="M10 20c2.7 0 4.96-.9 6.62-2.44l-3.23-2.5c-.9.6-2.05.95-3.39.95-2.6 0-4.8-1.76-5.59-4.12H1.07v2.58A10 10 0 0 0 10 20Z"
    />
    <path
      fill="#FBBC05"
      d="M4.41 11.89a6 6 0 0 1 0-3.78V5.53H1.07a10 10 0 0 0 0 8.94l3.34-2.58Z"
    />
    <path
      fill="#EA4335"
      d="M10 3.98c1.47 0 2.79.5 3.83 1.5l2.86-2.86A9.6 9.6 0 0 0 10 0 10 10 0 0 0 1.07 5.53l3.34 2.58C5.2 5.74 7.4 3.98 10 3.98Z"
    />
  </svg>
);

const AppleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path d="M13.62 10.62c.02 2.35 2.06 3.13 2.08 3.14-.02.05-.33 1.13-1.08 2.24-.65.96-1.32 1.92-2.38 1.94-1.04.02-1.38-.62-2.57-.62-1.2 0-1.57.6-2.55.64-1.03.04-1.81-1.04-2.46-2-.6-.92-1.06-1.99-1.34-3.2-.51-2.22-.09-4.73 1.5-6.14.79-.7 1.8-1.13 2.9-1.15 1.03-.02 2 .68 2.63.68.62 0 1.8-.84 3.04-.72.52.02 1.98.21 2.91 1.58-.08.05-1.74 1.02-1.72 3.04M11.9 3.83c.55-.66.92-1.58.82-2.5-.79.03-1.75.53-2.32 1.19-.51.58-.96 1.52-.84 2.42.88.07 1.79-.45 2.34-1.11" />
  </svg>
);

const EyeIcon = ({ off }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    {off ? (
      <>
        <path
          d="M9.88 9.88a3 3 0 0 0 4.24 4.24M10.73 5.08A11 11 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68M6.61 6.61A13.53 13.53 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61M2 2l20 20"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    ) : (
      <>
        <path
          d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
      </>
    )}
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M18 6 6 18M6 6l12 12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const GoogleButton = ({ onProfile, onError }) => {
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
        );
        if (!res.ok) throw new Error("userinfo failed");
        const profile = await res.json();
        onProfile({
          name: profile.name,
          email: profile.email,
          avatar: profile.picture,
          provider: "google",
        });
      } catch {
        onError("Google məlumatları alınmadı. Yenidən cəhd edin.");
      }
    },
    onError: () => onError("Google girişi ləğv edildi."),
  });

  return (
    <button
      type="button"
      className="auth-social-btn"
      aria-label="Google ilə davam et"
      onClick={() => googleLogin()}
    >
      <GoogleIcon />
    </button>
  );
};

const AuthModal = () => {
  const {
    authModal,
    authRedirect,
    openAuth,
    closeAuth,
    login,
    register,
    socialLogin,
    error,
  } = useContext(AuthContext);
  const navigate = useNavigate();

  const isRegister = authModal === "register";
  const [socialError, setSocialError] = useState("");

  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authModal) {
      setName("");
      setSurname("");
      setPhone("");
      setEmail("");
      setPassword("");
      setShowPassword(false);
      setSocialError("");
    }
  }, [authModal]);

  useEffect(() => {
    if (!authModal) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeAuth();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [authModal, closeAuth]);

  const finishAuth = () => {
    const target = authRedirect || "/profile/account";
    closeAuth();
    navigate(target);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    let success = false;
    if (isRegister) {
      success = register({ name, surname, phone, email });
    } else {
      success = await login(email);
    }
    setSubmitting(false);
    if (success) finishAuth();
  };

  const handleGoogleProfile = (profile) => {
    setSocialError("");
    socialLogin(profile);
    finishAuth();
  };

  const handleGoogleUnconfigured = () => {
    setSocialError("Google girişi konfiqurasiya edilməyib (VITE_GOOGLE_CLIENT_ID).");
  };

  if (!authModal) return null;

  return (
    <div className="auth-modal-backdrop" onClick={closeAuth}>
      <div
        className="auth-modal"
        role="dialog"
        aria-modal="true"
        aria-label={isRegister ? "Qeydiyyat" : "Daxil ol"}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="auth-modal-head">
          <h2>{isRegister ? "Qeydiyyat" : "Daxil ol"}</h2>
          <button
            type="button"
            className="auth-modal-close"
            onClick={closeAuth}
            aria-label="Bağla"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="auth-modal-body">
        <form className="auth-modal-form" onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <div className="auth-field">
                <label htmlFor="auth-name">Ad</label>
                <input
                  id="auth-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Adınızı daxil edin"
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="auth-surname">Soyad</label>
                <input
                  id="auth-surname"
                  type="text"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  placeholder="Soyadınızı daxil edin"
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="auth-phone">Mobil nömrə</label>
                <div className="auth-phone">
                  <span className="auth-phone-code">
                    <FlagAzIcon />
                    <span>+994</span>
                  </span>
                  <input
                    id="auth-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="50 123 45 67"
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div className="auth-field">
            <label htmlFor="auth-email">E-poçt</label>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="auth-password">Şifrə</label>
            <div className="auth-password">
              <input
                id="auth-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className="auth-eye"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Şifrəni gizlət" : "Şifrəni göstər"}
              >
                <EyeIcon off={!showPassword} />
              </button>
            </div>
          </div>

          {!isRegister && (
            <div className="auth-row">
              <label className="auth-remember">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span>Yadda saxla</span>
              </label>
              <button type="button" className="auth-forgot">
                Şifrəni unutmusunuz?
              </button>
            </div>
          )}

          {error && <p className="auth-modal-error">{error}</p>}

          <button type="submit" className="buy-btn auth-submit" disabled={submitting}>
            {submitting
              ? "Yoxlanılır..."
              : isRegister
                ? "Qeydiyyat"
                : "Daxil ol"}
          </button>
        </form>

        <div className="auth-divider">
          <span>və ya</span>
        </div>

        {socialError && <p className="auth-modal-error">{socialError}</p>}

        <div className="auth-social">
          {GOOGLE_CLIENT_ID ? (
            <GoogleButton
              onProfile={handleGoogleProfile}
              onError={setSocialError}
            />
          ) : (
            <button
              type="button"
              className="auth-social-btn"
              aria-label="Google ilə davam et"
              onClick={handleGoogleUnconfigured}
            >
              <GoogleIcon />
            </button>
          )}
          <button
            type="button"
            className="auth-social-btn"
            aria-label="Apple ilə davam et"
            disabled
            title="Apple ilə giriş hələ mümkün deyil"
          >
            <AppleIcon />
          </button>
        </div>

        <p className="auth-modal-switch">
          {isRegister ? "Hesabınız var? " : "Hesabınız yoxdur? "}
          <button
            type="button"
            onClick={() => openAuth(isRegister ? "login" : "register", authRedirect)}
          >
            {isRegister ? "Daxil ol" : "Qeydiyyat"}
          </button>
        </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
