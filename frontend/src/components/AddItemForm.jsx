import { useState } from "react";
import { CATEGORIES } from "../constants";

export default function AddItemForm({ onAdd }) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [category, setCategory] = useState("Other");
  const [price, setPrice] = useState("");
  const [expanded, setExpanded] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({
      name: name.trim(),
      quantity: Number(quantity),
      category,
      price: price !== "" ? Number(price) : null,
    });
    setName("");
    setQuantity(1);
    setCategory("Other");
    setPrice("");
    setExpanded(false);
  }

  return (
    <form onSubmit={handleSubmit} className="add-form">
      <div className="add-row">
        <input
          className="input-name"
          type="text"
          placeholder="Add an item..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          onFocus={() => setExpanded(true)}
        />
        <input
          className="input-qty"
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          aria-label="Quantity"
        />
        <button type="submit" className="btn-add">+ Add</button>
      </div>

      {expanded && (
        <div className="add-extra">
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c.name} value={c.name}>{c.icon} {c.name}</option>
            ))}
          </select>
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Price (optional)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="input-price"
          />
        </div>
      )}
    </form>
  );
}
