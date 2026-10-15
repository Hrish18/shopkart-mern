function SearchBar({ value, onChange }) {
  return (
    <input
      className="search-input"
      type="text"
      placeholder="Search products..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export default SearchBar;