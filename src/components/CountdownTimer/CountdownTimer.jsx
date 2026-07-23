const CountdownTimer = ({ minutes, seconds, isExpired }) => {
  if (isExpired) {
    return <p className="countdown expired">Vaxt bitdi</p>;
  }

  return (
    <p className="countdown">
      Ödəniş üçün qalan vaxt: {String(minutes).padStart(2, "0")}:
      {String(seconds).padStart(2, "0")}
    </p>
  );
};

export default CountdownTimer;
