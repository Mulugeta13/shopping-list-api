import { useState } from "react";
import { CATEGORIES, getCategoryIcon } from "../constants";

function ItemRow({ item, onToggle, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [name, setName] = useState(item.name);
  const [quantity, setQuantity] = useState(item.quantity);
  const [category, setCategory] = useState(item.category);
  const [price, setPrice] = useState(item.price ?? "");

  function handleSave() {
    if (!name.trim()) return;
    onUpdate(item.id, {
      name: name.trim(),
      quantity: Number(quantity),
      category,
      price: price !== "" ? Number(price) : null,
    });
    setEditing(false);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") cancelEdit();
  }

  function cancelEdit() {
    setName(item.name);
    setQuantity(item.quantity);
    setCategory(item.category);
    setPrice(item.price ?? "");
    setEditing(false);
  }

  if (editing) {
    return (
      <li className="item-row editing">
        <div className="edit-grid">
          <input
            autoFocus
            className="edit-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Item name"
          />
          <input
            className="edit-qty"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <select
            className="edit-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c.name} value={c.name}>{c.icon} {c.name}</option>
            ))}
          </select>
          <input
            className="edit-price"
            type="number"
            min="0"
            step="0.01"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div className="edit-actions">
          <button className="btn-save" onClick={handleSave}>Save</button>
          <button className="btn-cancel" onClick={cancelEdit}>Cancel</button>
        </div>
      </li>
    );
  }

  return (
    <li className={`item-row ${item.purchased ? "purchased" : ""}`}>
      <button
        className={`check-btn ${item.purchased ? "checked" : ""}`}
        onClick={() => onToggle(item.id)}
        title={item.purchased ? "Mark as remaining" : "Mark as purchased"}
      >
        {item.purchased ? "✓" : ""}
      </button>

      <span className="item-category-icon" title={item.category}>
        {getCategoryIcon(item.category)}
      </span>

      <div className="item-info">
        <span className="item-name">{item.name}</span>
        <span className="item-meta">
          ×{item.quantity}
          {item.price != null && (
            <span className="item-price"> · ${(item.price * item.quantity).toFixed(2)}</span>
          )}
        </span>
      </div>

      {confirmDelete ? (
        <div className="confirm-delete">
          <span>Delete?</span>
          <button className="btn-confirm-yes" onClick={() => onDelete(item.id)}>Yes</button>
          <button className="btn-confirm-no" onClick={() => setConfirmDelete(false)}>No</button>
        </div>
      ) : (
        <div className="item-actions">
          <button className="btn-edit" onClick={() => setEditing(true)} title="Edit">✎</button>
          <button className="btn-delete" onClick={() => setConfirmDelete(true)} title="Delete">✕</button>
        </div>
      )}
    </li>
  );
}

export default function ItemList({ items, onToggle, onDelete, onUpdate }) {
  if (items.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🛒</div>
        <p>Your list is empty.</p>
        <p className="empty-sub">Add an item above to get started.</p>
      </div>
    );
  }

  // Group items by category
  const groups = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="item-list">
      {Object.entries(groups).map(([cat, catItems]) => (
        <div key={cat} className="category-group">
          <div className="category-header">
            <span>{getCategoryIcon(cat)}</span>
            <span>{cat}</span>
            <span className="category-count">{catItems.length}</span>
          </div>
          <ul className="category-items">
            {catItems.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                onToggle={onToggle}
                onDelete={onDelete}
                onUpdate={onUpdate}
              />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
