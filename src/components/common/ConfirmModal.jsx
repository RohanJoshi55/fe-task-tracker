import { AlertTriangle, Loader2, X } from "lucide-react";
import "./ConfirmModal.css";

const ConfirmModal = ({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  loading = false,
  danger = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="confirm-modal-overlay"
      onMouseDown={onCancel}
    >
      <section
        className="confirm-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          className="confirm-modal-close"
          type="button"
          onClick={onCancel}
          disabled={loading}
          aria-label="Close confirmation"
        >
          <X size={18} />
        </button>

        <div
          className={`confirm-modal-icon ${
            danger ? "danger" : ""
          }`}
        >
          <AlertTriangle size={26} />
        </div>

        <h2 id="confirm-modal-title">{title}</h2>

        <p>{message}</p>

        <div className="confirm-modal-actions">
          <button
            type="button"
            className="confirm-modal-cancel"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </button>

          <button
            type="button"
            className={`confirm-modal-confirm ${
              danger ? "danger" : ""
            }`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading && <Loader2 size={17} className="spin" />}

            {loading ? "Please wait..." : confirmText}
          </button>
        </div>
      </section>
    </div>
  );
};

export default ConfirmModal;