export default function BudgetPanel({ items }) {
  const itemsWithPrice = items.filter((i) => i.price != null);
  if (itemsWithPrice.length === 0) return null;

  const totalCost = items.reduce((sum, i) => sum + (i.price ?? 0) * i.quantity, 0);
  const purchasedCost = items
    .filter((i) => i.purchased)
    .reduce((sum, i) => sum + (i.price ?? 0) * i.quantity, 0);
  const remainingCost = totalCost - purchasedCost;

  return (
    <div className="budget-panel">
      <div className="budget-title">Budget Summary</div>
      <div className="budget-row">
        <span>Total</span>
        <span className="budget-total">${totalCost.toFixed(2)}</span>
      </div>
      <div className="budget-row">
        <span>Purchased</span>
        <span className="budget-purchased">${purchasedCost.toFixed(2)}</span>
      </div>
      <div className="budget-row">
        <span>Remaining</span>
        <span className="budget-remaining">${remainingCost.toFixed(2)}</span>
      </div>
    </div>
  );
}
