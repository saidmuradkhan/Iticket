import { useLanguage } from "../../hooks/useLanguage";

const Modal = ({ children, onClose }) => {
  const { t } = useLanguage();
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose} aria-label={t("modal.close")}> ✕ </button>{children}
      </div>
    </div>
  );
};

export default Modal;
