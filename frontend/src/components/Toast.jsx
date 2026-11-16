import { useEffect } from "react";

export default function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icon = type === "success" ? "✓" : type === "error" ? "✕" : "ℹ";

  return (
    <div className={`toast toast-${type}`}>
      <span className="toast-icon">{icon}</span>
      {message}
    </div>
  );
}
