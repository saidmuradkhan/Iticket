import { useParams } from "react-router-dom";

const SeatSelection = () => {
  const { id } = useParams();
  return <div className="page">Oturacaq seçimi ({id}) - tezliklə</div>;
};

export default SeatSelection;
