export const CATEGORIES = [
  { name: "Fruits & Vegetables", icon: "🥦" },
  { name: "Dairy & Eggs",        icon: "🥛" },
  { name: "Meat & Fish",         icon: "🥩" },
  { name: "Bakery",              icon: "🍞" },
  { name: "Drinks",              icon: "🧃" },
  { name: "Snacks",              icon: "🍿" },
  { name: "Cleaning",            icon: "🧹" },
  { name: "Vegetarian",          icon: "🌱" },
  { name: "Other",               icon: "🛍️" },
];

export function getCategoryIcon(name) {
  return CATEGORIES.find((c) => c.name === name)?.icon ?? "🛍️";
}
