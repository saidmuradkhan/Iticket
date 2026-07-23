const METHODS = [
  { key: "online", label: "Onlayn ödəniş" },
  { key: "wallet", label: "Cüzdan" },
  { key: "googlepay", label: "Google Pay" },
  { key: "applepay", label: "Apple Pay" },
];

const PaymentMethods = ({ selected, onSelect }) => {
  return (
    <div className="payment-methods">
      {METHODS.map((method) => (
        <button key={method.key} type="button" className={ selected === method.key ? "payment-method active" : "payment-method" } onClick={() => onSelect(method.key)} >
          {method.label}
        </button>
      ))}
    </div>
  );
};

export default PaymentMethods;
