import { getCategoryIcon } from "../constants";

export default function HistoryPanel({ history, onReAdd, onClose }) {
  return (
    <div className="history-overlay" onClick={onClose}>
      <div className="history-panel" onClick={(e) => e.stopPropagation()}>
        <div className="history-header">
          <h2>Purchase History</h2>
          <button className="history-close" onClick={onClose}>✕</button>
        </div>

        {history.length === 0 ? (
          <p className="history-empty">No purchase history yet.</p>
        ) : (
          <ul className="history-list">
            {history.map((item) => (
              <li key={item.id} className="history-item">
                <span className="history-icon">{getCategoryIcon(item.category)}</span>
                <div className="history-info">
                  <span className="history-name">{item.name}</span>
                  <span className="history-meta">
                    {item.category} · ×{item.quantity}
                    {item.price != null && ` · $${(item.price * item.quantity).toFixed(2)}`}
                  </span>
                </div>
                <button className="btn-readd" onClick={() => onReAdd(item)}>
                  + Add again
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
