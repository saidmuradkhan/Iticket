const METHODS = [
  { key: "online", label: "Onlayn", icon: "fas fa-credit-card" },
  { key: "googlepay", label: "Google Pay", icon: "fab fa-google-pay" },
  { key: "applepay", label: "Apple Pay", icon: "fab fa-apple-pay" },
  { key: "wallet", label: "Cüzdan", icon: "fas fa-wallet" },
];

const PaymentMethods = ({ selected, onSelect, walletBalance, walletDisabled }) => {
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
                {method.label}
                {isWallet && walletBalance !== null && walletBalance !== undefined && (
                  <span className="payment-method-note">
                    {Number(walletBalance).toFixed(2)} ₼
                    {disabled && " · kifayət etmir"}
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
