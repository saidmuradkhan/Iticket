import { useParams } from "react-router-dom";

const EventDetail = () => {
  const { id } = useParams();
  return <div className="page">Tədbir detalı ({id}) - tezliklə</div>;
};

export default EventDetail;
