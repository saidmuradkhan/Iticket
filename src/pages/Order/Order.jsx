import { useParams } from "react-router-dom";

const Order = () => {
  const { orderId } = useParams();
  return <div className="page">Sifariş ({orderId}) - tezliklə</div>;
};

export default Order;
