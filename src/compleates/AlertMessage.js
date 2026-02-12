export default function AlertMessage({
  show,
  message,
  type = "success", // success | danger | warning | info
  onClose,
  buttonText = "OK",
}) {
  if (!show) return null;

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100
                 d-flex align-items-center justify-content-center"
      style={{ background: "rgba(0,0,0,0.4)", zIndex: 1050 }}
    >
      <div className="alert alert-light shadow rounded p-4" style={{ minWidth: "300px" }}>
        <div className={`alert alert-${type} mb-3`}>
          {message}
        </div>

        <div className="text-end">
          <button
            className={`btn btn-${type} btn-sm`}
            onClick={onClose}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
