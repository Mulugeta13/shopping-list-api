import { useState, useEffect, useCallback, useRef } from "react";
import { getItems, getHistory, createItem, updateItem, togglePurchased, deleteItem } from "./api";
import { CATEGORIES } from "./constants";
import AddItemForm from "./components/AddItemForm";
import ItemList from "./components/ItemList";
import BudgetPanel from "./components/BudgetPanel";
import HistoryPanel from "./components/HistoryPanel";
import Toast from "./components/Toast";

export default function App() {
  const [items, setItems] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  // Filter & sort state
  const [search, setSearch] = useState("");
  const [filterPurchased, setFilterPurchased] = useState(null);
  const [filterCategory, setFilterCategory] = useState("");
  const [sort, setSort] = useState("created_at");

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
  }, []);

  // useCallback ensures the function reference updates when filters change,
  // so useEffect always calls the latest version with the correct filter values.
  const loadItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getItems({
        purchased: filterPurchased,
        category: filterCategory || null,
        search: search || null,
        sort,
      });
      setItems(data);
    } catch (err) {
      setError("Could not connect to the server. Make sure the backend and Docker are running.");
    } finally {
      setLoading(false);
    }
  }, [filterPurchased, filterCategory, sort, search]);

  // Reload whenever filters change. Debounce search by 300ms.
  useEffect(() => {
    const delay = search ? 300 : 0;
    const timer = setTimeout(loadItems, delay);
    return () => clearTimeout(timer);
  }, [loadItems, search]);

  async function handleAdd(item) {
    try {
      const created = await createItem(item);
      setItems((prev) => [...prev, created]);
      showToast(`"${created.name}" added`);
    } catch {
      showToast("Failed to add item", "error");
    }
  }

  async function handleUpdate(id, data) {
    try {
      const updated = await updateItem(id, data);
      setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
      showToast("Item updated");
    } catch {
      showToast("Failed to update item", "error");
    }
  }

  async function handleToggle(id) {
    try {
      const updated = await togglePurchased(id);
      setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
      showToast(updated.purchased ? "Marked as purchased ✓" : "Moved back to list");
    } catch {
      showToast("Failed to update item", "error");
    }
  }

  async function handleDelete(id) {
    const item = items.find((i) => i.id === id);
    try {
      await deleteItem(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      showToast(`"${item.name}" removed`, "error");
    } catch {
      showToast("Failed to delete item", "error");
    }
  }

  async function handleClearPurchased() {
    const purchased = items.filter((i) => i.purchased);
    try {
      await Promise.all(purchased.map((i) => deleteItem(i.id)));
      setItems((prev) => prev.filter((i) => !i.purchased));
      showToast(`${purchased.length} item(s) cleared`);
    } catch {
      showToast("Failed to clear items", "error");
    }
  }

  async function handleOpenHistory() {
    try {
      const data = await getHistory();
      setHistory(data);
      setShowHistory(true);
    } catch {
      showToast("Failed to load history", "error");
    }
  }

  async function handleReAdd(historyItem) {
    try {
      const created = await createItem({
        name: historyItem.name,
        quantity: historyItem.quantity,
        category: historyItem.category,
        price: historyItem.price,
      });
      setItems((prev) => [...prev, created]);
      showToast(`"${created.name}" added back`);
    } catch {
      showToast("Failed to add item", "error");
    }
  }

  const total = items.length;
  const purchasedCount = items.filter((i) => i.purchased).length;
  const progress = total === 0 ? 0 : Math.round((purchasedCount / total) * 100);

  return (
    <div className="page">
      <div className="container">
        {/* Header */}
        <header className="header">
          <div className="header-left">
            <h1>🛒 Shopping List</h1>
            {total > 0 && (
              <span className="progress-label">{purchasedCount}/{total} purchased</span>
            )}
          </div>
          <button className="btn-history" onClick={handleOpenHistory}>
            History
          </button>
        </header>

        {/* Progress bar */}
        {total > 0 && (
          <div className="progress-wrap">
            <div className="progress-bar" style={{ width: `${progress}%` }} />
          </div>
        )}

        {/* Add form */}
        <AddItemForm onAdd={handleAdd} />

        {/* Budget panel */}
        <BudgetPanel items={items} />

        {/* Toolbar */}
        <div className="toolbar">
          <input
            className="search-input"
            type="search"
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="toolbar-right">
            <select
              className="filter-select"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">All categories</option>
              {CATEGORIES.map((c) => (
                <option key={c.name} value={c.name}>{c.icon} {c.name}</option>
              ))}
            </select>

            <select
              className="filter-select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="created_at">By date added</option>
              <option value="name">A → Z</option>
            </select>
          </div>
        </div>

        {/* Status filter tabs */}
        <div className="status-tabs">
          <button onClick={() => setFilterPurchased(null)} className={filterPurchased === null ? "active" : ""}>All</button>
          <button onClick={() => setFilterPurchased(false)} className={filterPurchased === false ? "active" : ""}>Remaining</button>
          <button onClick={() => setFilterPurchased(true)} className={filterPurchased === true ? "active" : ""}>Purchased</button>
          {purchasedCount > 0 && (
            <button className="btn-clear" onClick={handleClearPurchased}>
              Clear purchased
            </button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            <p>Loading your list...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>⚠️ {error}</p>
            <button className="btn-retry" onClick={loadItems}>Retry</button>
          </div>
        ) : (
          <ItemList
            items={items}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
          />
        )}
      </div>

      {/* History panel */}
      {showHistory && (
        <HistoryPanel
          history={history}
          onReAdd={handleReAdd}
          onClose={() => setShowHistory(false)}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
