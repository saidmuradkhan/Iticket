import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const AccountInfo = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="account-info">
      <h1>Hesab məlumatları</h1>
      <img className="account-avatar" src={user.avatar} alt={user.name} />
      <div className="account-field">
        <span>Ad Soyad</span>
        <p>{user.name}</p>
      </div>
      <div className="account-field">
        <span>E-poçt</span>
        <p>{user.email}</p>
      </div>
      <div className="account-field">
        <span>Telefon</span>
        <p>{user.phone}</p>
      </div>

      <button type="button" className="remove-btn" onClick={logout}>
        Çıxış et
      </button>
    </div>
  );
};

export default AccountInfo;
