export const formatPrice = (value) =>
  "₹" + Number(value).toLocaleString("en-IN");

export const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export const getStockInfo = (stock) => {
  if (stock <= 0) return { text: "Out of stock", className: "stock-out" };
  if (stock <= 10) return { text: `${stock} units left`, className: "stock-low" };
  return { text: "In stock", className: "stock-in" };
};