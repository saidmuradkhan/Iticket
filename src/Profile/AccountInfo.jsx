import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { CopyIcon, PencilIcon, TrashIcon } from "./ProfileIcons";
import { FlagAzIcon } from "../components/Header/HeaderIcons";

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

const COUNTRIES = [
  "Azərbaycan",
  "Türkiyə",
  "Gürcüstan",
  "Rusiya",
  "Birləşmiş Krallıq",
  "Almaniya",
  "BƏƏ",
];

const AccountInfo = () => {
  const { user, updateUser, logout } = useContext(AuthContext);

  const [firstName, lastName = ""] = (user.name || "").split(" ");
  const [form, setForm] = useState({
    firstName: user.firstName || firstName || "",
    lastName: user.lastName || lastName || "",
    birthDate: user.birthDate || "",
    country: user.country || "",
    gender: user.gender || "",
  });
  const [copied, setCopied] = useState("");
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Təsdiq pəncərəsi açıq olanda Escape ilə bağla + səhifə scroll-unu kilidlə
  useEffect(() => {
    if (!confirmDelete) return;
    const onKey = (e) => {
      if (e.key === "Escape") setConfirmDelete(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [confirmDelete]);

  const setField = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    setSaved(false);
  };

  const copy = (field, value) => {
    navigator.clipboard?.writeText(value);
    setCopied(field);
    setTimeout(() => setCopied(""), 1500);
  };

  const save = (e) => {
    e.preventDefault();
    updateUser({
      ...form,
      name: `${form.firstName} ${form.lastName}`.trim() || user.name,
    });
    setSaved(true);
  };

  return (
    <div className="profile-page">
      <div className="profile-page-head">
        <h1>Hesab məlumatları</h1>
      </div>

      <form className="account-form" onSubmit={save}>
        <div className="account-form-field">
          <span className="account-form-label">ID</span>
          <div className="account-form-control readonly">
            <input type="text" value={user.id} readOnly />
            <button
              type="button"
              className="account-form-icon"
              onClick={() => copy("id", String(user.id))}
              aria-label="ID-ni kopyala"
            >
              <CopyIcon />
            </button>
          </div>
          {copied === "id" && <small className="account-form-hint">Kopyalandı</small>}
        </div>

        <div className="account-form-field">
          <span className="account-form-label">
            Email
            <a className="account-form-edit" href="mailto:info@iticket.az" aria-label="Email dəyiş">
              <PencilIcon />
            </a>
          </span>
          <div className="account-form-control readonly">
            <input type="email" value={user.email} readOnly />
            <button
              type="button"
              className="account-form-icon"
              onClick={() => copy("email", user.email)}
              aria-label="Email-i kopyala"
            >
              <CopyIcon />
            </button>
          </div>
          {copied === "email" && (
            <small className="account-form-hint">Kopyalandı</small>
          )}
        </div>

        <div className="account-form-field">
          <span className="account-form-label">Mobil nömrə</span>
          <div className="account-form-control readonly">
            <span className="account-form-flag">
              <FlagAzIcon />
            </span>
            <input type="tel" value={user.phone || ""} readOnly />
          </div>
        </div>

        <div className="account-form-field">
          <label className="account-form-label" htmlFor="account-first-name">
            Ad
          </label>
          <div className="account-form-control">
            <input
              id="account-first-name"
              type="text"
              value={form.firstName}
              onChange={setField("firstName")}
              placeholder="Ad"
            />
          </div>
        </div>

        <div className="account-form-field">
          <label className="account-form-label" htmlFor="account-last-name">
            Soyad
          </label>
          <div className="account-form-control">
            <input
              id="account-last-name"
              type="text"
              value={form.lastName}
              onChange={setField("lastName")}
              placeholder="Soyad"
            />
          </div>
        </div>

        <div className="account-form-field">
          <label className="account-form-label" htmlFor="account-birth-date">
            Doğum tarixi
          </label>
          <div className="account-form-control">
            <input
              id="account-birth-date"
              type="date"
              value={form.birthDate}
              onChange={setField("birthDate")}
            />
          </div>
        </div>

        <div className="account-form-field">
          <label className="account-form-label" htmlFor="account-country">
            Ölkə
          </label>
          <div className="account-form-control">
            <select
              id="account-country"
              value={form.country}
              onChange={setField("country")}
            >
              <option value="">Ölkə seç</option>
              {COUNTRIES.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="account-form-field">
          <span className="account-form-label">Cins</span>
          <div className="account-gender">
            {["Kişi", "Qadın"].map((option) => (
              <button
                type="button"
                key={option}
                className={form.gender === option ? "active" : undefined}
                onClick={() => {
                  setForm((prev) => ({ ...prev, gender: option }));
                  setSaved(false);
                }}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="account-form-actions">
          <button type="submit" className="primary-btn">
            Yadda saxla
          </button>
          {saved && <span className="account-form-saved">Məlumatlar yeniləndi</span>}
        </div>
      </form>

      <button
        type="button"
        className="account-delete"
        onClick={() => setConfirmDelete(true)}
      >
        <TrashIcon />
        Hesabı sil
      </button>

      {confirmDelete && (
        <div
          className="auth-modal-backdrop"
          onClick={() => setConfirmDelete(false)}
        >
          <div
            className="auth-modal confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Hesabı sil"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="auth-modal-head">
              <h2>Hesabı sil</h2>
              <button
                type="button"
                className="auth-modal-close"
                onClick={() => setConfirmDelete(false)}
                aria-label="Bağla"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="auth-modal-body">
              <p className="confirm-text">
                Hesabınız silinəcək və bütün bilet məlumatlarınıza giriş
                dayandırılacaq. Bu əməliyyat geri qaytarılmır.
              </p>
              <div className="confirm-actions">
                <button type="button" className="confirm-danger" onClick={logout}>
                  Bəli, sil
                </button>
                <button
                  type="button"
                  className="confirm-cancel"
                  onClick={() => setConfirmDelete(false)}
                >
                  Ləğv et
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountInfo;
