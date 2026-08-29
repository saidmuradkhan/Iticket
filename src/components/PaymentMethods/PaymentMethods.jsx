import { useLanguage } from "../../hooks/useLanguage";

const METHODS = [
  { key: "online", labelKey: "paymentMethods.online", icon: "fas fa-credit-card" },
  { key: "googlepay", labelKey: "paymentMethods.googlePay", icon: "fab fa-google-pay" },
  { key: "applepay", labelKey: "paymentMethods.applePay", icon: "fab fa-apple-pay" },
  { key: "wallet", labelKey: "paymentMethods.wallet", icon: "fas fa-wallet" },
];

const PaymentMethods = ({ selected, onSelect, walletBalance, walletDisabled }) => {
  const { t } = useLanguage();
  return (
    <div className="payment-methods">
      {METHODS.map((method) => {
        const isWallet = method.key === "wallet";
        const disabled = isWallet && walletDisabled;
        const active = selected === method.key;

        return (
          <button
            key={method.key}
            type="button"
            className={active ? "payment-method active" : "payment-method"}
            disabled={disabled}
            onClick={() => onSelect(method.key)}
          >
            <span className="payment-method-left">
              <i className={`payment-method-icon ${method.icon}`} />
              <span className="payment-method-label">
                {t(method.labelKey)}
                {isWallet && walletBalance !== null && walletBalance !== undefined && (
                  <span className="payment-method-note">
                    {Number(walletBalance).toFixed(2)} ₼
                    {disabled && ` · ${t("paymentMethods.insufficient")}`}
                  </span>
                )}
              </span>
            </span>
            <span className={active ? "payment-radio checked" : "payment-radio"} />
          </button>
        );
      })}
    </div>
  );
};

export default PaymentMethods;
