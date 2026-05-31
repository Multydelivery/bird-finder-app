"use client";

export default function SearchBar({ searchTerm, onSearchChange }) {
  return (
    <div className="mb-8">
      <input
        type="text"
        placeholder="Search birds by name, scientific name, or description..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full rounded-full border border-gray-300 px-6 py-3 text-lg text-gray-900 placeholder:text-gray-500 shadow-sm focus:border-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-700"
      />
    </div>
  );
}
