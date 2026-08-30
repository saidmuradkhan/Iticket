import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { CopyIcon, PencilIcon, TrashIcon } from "./ProfileIcons";
import { FlagAzIcon } from "../components/Header/HeaderIcons";
import { useLanguage } from "../hooks/useLanguage";

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
  { value: "Azərbaycan", labelKey: "account.countryAzerbaijan" },
  { value: "Türkiyə", labelKey: "account.countryTurkey" },
  { value: "Gürcüstan", labelKey: "account.countryGeorgia" },
  { value: "Rusiya", labelKey: "account.countryRussia" },
  { value: "Birləşmiş Krallıq", labelKey: "account.countryUk" },
  { value: "Almaniya", labelKey: "account.countryGermany" },
  { value: "BƏƏ", labelKey: "account.countryUae" },
];

const GENDERS = [
  { value: "Kişi", labelKey: "account.genderMale" },
  { value: "Qadın", labelKey: "account.genderFemale" },
];

const AccountInfo = () => {
  const { t } = useLanguage();
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
        <h1>{t("account.title")}</h1>
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
              aria-label={t("account.copyId")}
            >
              <CopyIcon />
            </button>
          </div>
          {copied === "id" && (
            <small className="account-form-hint">{t("account.copied")}</small>
          )}
        </div>

        <div className="account-form-field">
          <span className="account-form-label">
            {t("account.email")}
            <a className="account-form-edit" href="mailto:info@iticket.az" aria-label={t("account.editEmail")}>
              <PencilIcon />
            </a>
          </span>
          <div className="account-form-control readonly">
            <input type="email" value={user.email} readOnly />
            <button
              type="button"
              className="account-form-icon"
              onClick={() => copy("email", user.email)}
              aria-label={t("account.copyEmail")}
            >
              <CopyIcon />
            </button>
          </div>
          {copied === "email" && (
            <small className="account-form-hint">{t("account.copied")}</small>
          )}
        </div>

        <div className="account-form-field">
          <span className="account-form-label">{t("account.phone")}</span>
          <div className="account-form-control readonly">
            <span className="account-form-flag">
              <FlagAzIcon />
            </span>
            <input type="tel" value={user.phone || ""} readOnly />
          </div>
        </div>

        <div className="account-form-field">
          <label className="account-form-label" htmlFor="account-first-name">
            {t("account.firstName")}
          </label>
          <div className="account-form-control">
            <input
              id="account-first-name"
              type="text"
              value={form.firstName}
              onChange={setField("firstName")}
              placeholder={t("account.firstName")}
            />
          </div>
        </div>

        <div className="account-form-field">
          <label className="account-form-label" htmlFor="account-last-name">
            {t("account.lastName")}
          </label>
          <div className="account-form-control">
            <input
              id="account-last-name"
              type="text"
              value={form.lastName}
              onChange={setField("lastName")}
              placeholder={t("account.lastName")}
            />
          </div>
        </div>

        <div className="account-form-field">
          <label className="account-form-label" htmlFor="account-birth-date">
            {t("account.birthDate")}
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
            {t("account.country")}
          </label>
          <div className="account-form-control">
            <select
              id="account-country"
              value={form.country}
              onChange={setField("country")}
            >
              <option value="">{t("account.countryPlaceholder")}</option>
              {COUNTRIES.map((country) => (
                <option key={country.value} value={country.value}>
                  {t(country.labelKey)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="account-form-field">
          <span className="account-form-label">{t("account.gender")}</span>
          <div className="account-gender">
            {GENDERS.map((option) => (
              <button
                type="button"
                key={option.value}
                className={form.gender === option.value ? "active" : undefined}
                onClick={() => {
                  setForm((prev) => ({ ...prev, gender: option.value }));
                  setSaved(false);
                }}
              >
                {t(option.labelKey)}
              </button>
            ))}
          </div>
        </div>

        <div className="account-form-actions">
          <button type="submit" className="primary-btn">
            {t("account.save")}
          </button>
          {saved && (
            <span className="account-form-saved">{t("account.saved")}</span>
          )}
        </div>
      </form>

      <button
        type="button"
        className="account-delete"
        onClick={() => setConfirmDelete(true)}
      >
        <TrashIcon />
        {t("account.deleteAccount")}
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
            aria-label={t("account.deleteAccount")}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="auth-modal-head">
              <h2>{t("account.deleteAccount")}</h2>
              <button
                type="button"
                className="auth-modal-close"
                onClick={() => setConfirmDelete(false)}
                aria-label={t("account.close")}
              >
                <CloseIcon />
              </button>
            </div>

            <div className="auth-modal-body">
              <p className="confirm-text">{t("account.deleteWarning")}</p>
              <div className="confirm-actions">
                <button type="button" className="confirm-danger" onClick={logout}>
                  {t("account.deleteConfirm")}
                </button>
                <button
                  type="button"
                  className="confirm-cancel"
                  onClick={() => setConfirmDelete(false)}
                >
                  {t("account.cancel")}
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
