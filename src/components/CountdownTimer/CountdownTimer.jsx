import { useLanguage } from "../../hooks/useLanguage";

const CountdownTimer = ({ minutes, seconds, isExpired }) => {
  const { t } = useLanguage();
  if (isExpired) {
    return <p className="countdown expired">{t("countdown.expired")}</p>;
  }

  return (
    <p className="countdown">
      {t("countdown.remaining", {
        time: `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
      })}
    </p>
  );
};

export default CountdownTimer;
