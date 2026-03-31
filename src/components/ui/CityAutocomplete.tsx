"use client";

import { useState, useRef, useEffect } from "react";
import { CITIES_BY_COUNTY } from "@/lib/cities";

interface CityAutocompleteProps {
  county: string;
  value: string;
  onChange: (value: string) => void;
  id?: string;
  placeholder?: string;
  className?: string;
}

export function CityAutocomplete({
  county,
  value,
  onChange,
  id = "city",
  placeholder = "Cauta orasul...",
  className = "",
}: CityAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const cities = county ? CITIES_BY_COUNTY[county] || [] : [];

  useEffect(() => {
    if (!county) {
      setFilteredCities([]);
      return;
    }
    if (!value.trim()) {
      setFilteredCities(cities);
    } else {
      const query = value.toLowerCase();
      setFilteredCities(
        cities.filter((c) => c.toLowerCase().includes(query))
      );
    }
  }, [value, county]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(city: string) {
    onChange(city);
    setIsOpen(false);
  }

  return (
    <div ref={wrapperRef} className="relative">
      <input
        ref={inputRef}
        id={id}
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => {
          if (county) setIsOpen(true);
        }}
        placeholder={county ? placeholder : "Selecteaza judetul intai"}
        disabled={!county}
        autoComplete="off"
        className={`w-full h-10 rounded-md border border-[#2A2A2A] bg-[#111111] px-3 text-sm text-[#EDEDED] placeholder:text-[#666] focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      />
      {isOpen && filteredCities.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-md border border-[#2A2A2A] bg-[#1E1E1E] shadow-lg">
          {filteredCities.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => handleSelect(city)}
              className="w-full text-left px-3 py-2 text-sm text-[#EDEDED] hover:bg-[#2A2A2A] hover:text-gold transition-colors"
            >
              {city}
            </button>
          ))}
        </div>
      )}
      {isOpen && county && filteredCities.length === 0 && value.trim() && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 rounded-md border border-[#2A2A2A] bg-[#1E1E1E] shadow-lg px-3 py-2 text-sm text-[#888]">
          Niciun oras gasit. Poti scrie orice localitate.
        </div>
      )}
    </div>
  );
}
