const Loader = ({ count = 8 }) => {
  return (
    <div className="loader-wrapper">
      <div className="top-progress-bar" />
      <div className="skeleton-grid">
        {Array.from({ length: count }).map((_, i) => (
          <div className="skeleton-card" key={i}>
            <div className="skeleton-image" />
            <div className="skeleton-line" />
            <div className="skeleton-line short" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Loader;
