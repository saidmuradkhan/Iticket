import { useParams } from "react-router-dom";

const EventList = () => {
  const { category, query } = useParams();
  return (
    <div className="page">
      Tədbirlər siyahısı ({category || `axtarış: ${query}`}) - tezliklə
    </div>
  );
};

export default EventList;
