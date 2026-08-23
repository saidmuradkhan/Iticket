import { useState } from "react";

const EMPTY = { current: "", next: "", repeat: "" };

const ChangePassword = () => {
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
      setError("Yeni şifrə ən azı 8 simvoldan ibarət olmalıdır.");
      return;
    }
    if (form.next !== form.repeat) {
      setError("Şifrələr uyğun gəlmir.");
      return;
    }

    setForm(EMPTY);
    setDone(true);
  };

  return (
    <div className="profile-page">
      <div className="profile-page-head">
        <h1>Şifrəni dəyiş</h1>
      </div>

      <form className="profile-form" onSubmit={submit}>
        <label>
          Mövcud şifrə
          <input
            type="password"
            value={form.current}
            onChange={setField("current")}
            autoComplete="current-password"
          />
        </label>
        <label>
          Yeni şifrə
          <input
            type="password"
            value={form.next}
            onChange={setField("next")}
            autoComplete="new-password"
          />
        </label>
        <label>
          Yeni şifrəni təkrarla
          <input
            type="password"
            value={form.repeat}
            onChange={setField("repeat")}
            autoComplete="new-password"
          />
        </label>

        {error && <p className="profile-form-error">{error}</p>}
        {done && <p className="profile-form-success">Şifrə yeniləndi.</p>}

        <button type="submit" className="primary-btn">
          Yadda saxla
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
