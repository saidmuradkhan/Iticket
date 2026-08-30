import { useState } from "react";
import { useLanguage } from "../hooks/useLanguage";

const EMPTY = { current: "", next: "", repeat: "" };

const ChangePassword = () => {
  const { t } = useLanguage();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const setField = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    setError("");
    setDone(false);
  };

  const submit = (e) => {
    e.preventDefault();

    if (form.next.length < 8) {
      setError(t("changePassword.minLengthError"));
      return;
    }
    if (form.next !== form.repeat) {
      setError(t("changePassword.mismatchError"));
      return;
    }

    setForm(EMPTY);
    setDone(true);
  };

  return (
    <div className="profile-page">
      <div className="profile-page-head">
        <h1>{t("changePassword.title")}</h1>
      </div>

      <form className="profile-form" onSubmit={submit}>
        <label>
          {t("changePassword.current")}
          <input type="password" value={form.current} onChange={setField("current")} autoComplete="current-password" />
        </label>
        <label>
          {t("changePassword.new")}
          <input type="password" value={form.next} onChange={setField("next")} autoComplete="new-password" />
        </label>
        <label>
          {t("changePassword.repeat")}
          <input type="password" value={form.repeat} onChange={setField("repeat")} autoComplete="new-password" />
        </label>

        {error && <p className="profile-form-error">{error}</p>}
        {done && <p className="profile-form-success">{t("changePassword.success")}</p>}

        <button type="submit" className="primary-btn">{t("changePassword.save")}</button>
      </form>
    </div>
  );
};

export default ChangePassword;
