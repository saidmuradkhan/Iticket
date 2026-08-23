import { useState } from "react";

const AMOUNTS = [20, 50, 100, 200];

const GiftCard = () => {
  const [amount, setAmount] = useState(50);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");

  const activate = (e) => {
    e.preventDefault();
    setMessage(
      code.trim().length < 6
        ? "Kod ən azı 6 simvoldan ibarət olmalıdır."
        : "Bu kod tapılmadı. Zəhmət olmasa yenidən yoxlayın."
    );
  };

  return (
    <div className="profile-page">
      <div className="profile-page-head">
        <h1>iGift hədiyyə kartı</h1>
      </div>

      <div className="gift-card-banner">
        <span>iGift</span>
        <strong>{amount} ₼</strong>
        <p>iTicket.az-da istənilən tədbir üçün etibarlıdır</p>
      </div>

      <h2 className="profile-subheading">Məbləğ seç</h2>
      <div className="gift-amounts">
        {AMOUNTS.map((value) => (
          <button
            type="button"
            key={value}
            className={amount === value ? "active" : undefined}
            onClick={() => setAmount(value)}
          >
            {value} ₼
          </button>
        ))}
      </div>

      <h2 className="profile-subheading">Hədiyyə kartını aktivləşdir</h2>
      <form className="gift-form" onSubmit={activate}>
        <input
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setMessage("");
          }}
          placeholder="Hədiyyə kartının kodu"
        />
        <button type="submit" className="primary-btn">
          Aktivləşdir
        </button>
      </form>
      {message && <p className="profile-form-error">{message}</p>}
    </div>
  );
};

export default GiftCard;
