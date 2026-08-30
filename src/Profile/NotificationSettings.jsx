import { useLocalStorage } from "../hooks/useLocalStorage";
import { useLanguage } from "../hooks/useLanguage";

const CHANNELS = [
  { key: "email", label: "notifSettings.channelEmail" },
  { key: "sms", label: "notifSettings.channelSms" },
  { key: "push", label: "notifSettings.channelPush" },
];

const TOPICS = [
  { key: "orders", label: "notifSettings.topicOrders" },
  { key: "reminders", label: "notifSettings.topicReminders" },
  { key: "newEvents", label: "notifSettings.topicNewEvents" },
  { key: "discounts", label: "notifSettings.topicDiscounts" },
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
  const { t } = useLanguage();
  const [settings, setSettings] = useLocalStorage(
    "notificationSettings",
    DEFAULTS
  );

  const toggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderRow = (item) => (
    <label className="switch-row" key={item.key}>
      <span>{t(item.label)}</span>
      <input type="checkbox" checked={!!settings[item.key]} onChange={() => toggle(item.key)} />
      <span className="switch-track" aria-hidden="true" />
    </label>
  );

  return (
    <div className="profile-page">
      <div className="profile-page-head">
        <h1>{t("notifSettings.title")}</h1>
      </div>

      <h2 className="profile-subheading">{t("notifSettings.channelsHeading")}</h2>
      <div className="switch-list">{CHANNELS.map(renderRow)}</div>

      <h2 className="profile-subheading">{t("notifSettings.topicsHeading")}</h2>
      <div className="switch-list">{TOPICS.map(renderRow)}</div>
    </div>
  );
};

export default NotificationSettings;
