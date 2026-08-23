import { useLocalStorage } from "../hooks/useLocalStorage";

const CHANNELS = [
  { key: "email", label: "Email" },
  { key: "sms", label: "SMS" },
  { key: "push", label: "Push bildiriş" },
];

const TOPICS = [
  { key: "orders", label: "Sifariş və ödəniş bildirişləri" },
  { key: "reminders", label: "Tədbir xatırlatmaları" },
  { key: "newEvents", label: "Yeni tədbirlər" },
  { key: "discounts", label: "Endirim və kampaniyalar" },
];

const DEFAULTS = {
  email: true,
  sms: true,
  push: false,
  orders: true,
  reminders: true,
  newEvents: false,
  discounts: false,
};

const NotificationSettings = () => {
  const [settings, setSettings] = useLocalStorage(
    "notificationSettings",
    DEFAULTS
  );

  const toggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderRow = (item) => (
    <label className="switch-row" key={item.key}>
      <span>{item.label}</span>
      <input
        type="checkbox"
        checked={!!settings[item.key]}
        onChange={() => toggle(item.key)}
      />
      <span className="switch-track" aria-hidden="true" />
    </label>
  );

  return (
    <div className="profile-page">
      <div className="profile-page-head">
        <h1>Bildiriş ayarları</h1>
      </div>

      <h2 className="profile-subheading">Bildiriş kanalları</h2>
      <div className="switch-list">{CHANNELS.map(renderRow)}</div>

      <h2 className="profile-subheading">Mövzular</h2>
      <div className="switch-list">{TOPICS.map(renderRow)}</div>
    </div>
  );
};

export default NotificationSettings;
