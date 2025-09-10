"use client";

import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { useLocale } from "@/components/LocaleProvider";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, placeholder }) => {
  const { t } = useLocale();
  const [query, setQuery] = useState("");
  const defaultPlaceholder = placeholder || t("common.search");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-[100%]">
      <input
        type="text"
        className="w-[100%] h-[44px] rounded-[8px] px-[16px] py-[12px] border-none focus:outline-none focus:ring-[2px] focus:ring-[var(--primary-color)]"
        style={{
          backgroundColor: "var(--search-background)",
          color: "var(--foreground)",
        }}
        placeholder={defaultPlaceholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button
        type="submit"
        className="absolute right-[12px] top-[50%] translate-y-[-50%]"
        style={{ color: "var(--tab-inactive-color)" }}
      >
        {React.createElement(FaSearch as React.ComponentType, {})}
      </button>
    </form>
  );
};

export default SearchBar;
