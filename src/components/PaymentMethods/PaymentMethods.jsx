const METHODS = [
  { key: "online", label: "Onlayn ödəniş" },
  { key: "wallet", label: "Cüzdan" },
  { key: "googlepay", label: "Google Pay" },
  { key: "applepay", label: "Apple Pay" },
];

const PaymentMethods = ({ selected, onSelect, walletBalance, walletDisabled }) => {
  return (
    <div className="payment-methods">
      {METHODS.map((method) => {
        const isWallet = method.key === "wallet";
        const disabled = isWallet && walletDisabled;

        return (
          <button
            key={method.key}
            type="button"
            className={ selected === method.key ? "payment-method active" : "payment-method" }
            disabled={disabled}
            onClick={() => onSelect(method.key)}
          >
            {method.label}
            {isWallet && walletBalance !== null && walletBalance !== undefined && (
              <span className="payment-method-note">
                {Number(walletBalance).toFixed(2)} ₼
                {disabled && " · kifayət etmir"}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default PaymentMethods;
