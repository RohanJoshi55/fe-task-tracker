const StatCard = ({ title, value, icon, helper }) => {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div>
        <p>{title}</p>
        <h2>{value}</h2>
        <span>{helper}</span>
      </div>
    </div>
  );
};

export default StatCard;