"use client";

import React, { useState, useEffect, useRef } from "react";
import { MapPin, Loader2, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/lib/hooks/use-debounce";

export interface AddressPrediction {
  place_id: string;
  description: string;
  main_text: string;
  secondary_text: string;
}

interface AddressAutocompleteInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onSelectPrediction?: (prediction: AddressPrediction) => void;
  placeholder?: string;
  leftIcon?: React.ReactNode;
  rightAction?: React.ReactNode;
  hasError?: boolean;
  className?: string;
  autoFocus?: boolean;
}

export function AddressAutocompleteInput({
  id,
  value,
  onChange,
  onSelectPrediction,
  placeholder = "Enter address or landmark",
  leftIcon,
  rightAction,
  hasError,
  className,
  autoFocus = false,
}: AddressAutocompleteInputProps) {
  const [inputValue, setInputValue] = useState(value || "");
  const [predictions, setPredictions] = useState<AddressPrediction[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [justSelected, setJustSelected] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync internal state when external value changes (e.g. current location button)
  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  const debouncedQuery = useDebounce(inputValue, 300);

  // Fetch predictions when debounced input changes
  useEffect(() => {
    if (justSelected) {
      setJustSelected(false);
      return;
    }

    const trimmed = debouncedQuery.trim();
    if (trimmed.length < 2) {
      setPredictions([]);
      setIsOpen(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    fetch(`/api/places/autocomplete?input=${encodeURIComponent(trimmed)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data && Array.isArray(data.predictions) && data.predictions.length > 0) {
          setPredictions(data.predictions);
          setIsOpen(true);
          setHighlightedIndex(-1);
        } else {
          setPredictions([]);
          setIsOpen(false);
        }
      })
      .catch((err) => {
        console.error("Autocomplete fetch error:", err);
        if (isMounted) {
          setPredictions([]);
          setIsOpen(false);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [debouncedQuery]);

  // Handle outside click to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    onChange(val);
  };

  const handleSelect = (item: AddressPrediction) => {
    setJustSelected(true);
    setInputValue(item.description);
    onChange(item.description);
    if (onSelectPrediction) {
      onSelectPrediction(item);
    }
    setPredictions([]);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || predictions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < predictions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : predictions.length - 1
      );
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelect(predictions[highlightedIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", isOpen ? "z-30" : "z-10", className)}>
      <div
        className={cn(
          "relative flex items-center rounded-2xl border px-3.5 py-3.5 bg-white transition-all focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500",
          hasError ? "border-red-300 bg-red-50/30" : "border-slate-200"
        )}
      >
        {leftIcon && <div className="shrink-0 mr-3">{leftIcon}</div>}

        <input
          ref={inputRef}
          id={id}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => {
            if (predictions.length > 0 && inputValue.trim().length >= 2) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          autoComplete="off"
          className="w-full bg-transparent text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none"
        />

        {isLoading && (
          <div className="shrink-0 px-1 text-slate-400 animate-spin">
            <Loader2 className="w-4 h-4" />
          </div>
        )}

        {rightAction && <div className="shrink-0 ml-1">{rightAction}</div>}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && predictions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl ring-1 ring-slate-900/10 transition-all animate-in fade-in slide-in-from-top-1 duration-150">
          <ul className="max-h-60 overflow-y-auto py-1 divide-y divide-slate-100 text-left">
            {predictions.map((pred, index) => {
              const isHighlighted = highlightedIndex === index;
              return (
                <li
                  key={pred.place_id || index}
                  onClick={() => handleSelect(pred)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={cn(
                    "flex items-start gap-3 px-3.5 py-2.5 cursor-pointer transition-colors text-left",
                    isHighlighted ? "bg-blue-50/80 text-blue-900" : "hover:bg-slate-50 text-slate-800"
                  )}
                >
                  <div className="mt-0.5 p-1 rounded-lg bg-blue-100/60 text-blue-600 shrink-0">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate text-slate-900 leading-tight">
                      {pred.main_text || pred.description}
                    </p>
                    {pred.secondary_text && (
                      <p className="text-xs text-slate-500 truncate mt-0.5 leading-snug">
                        {pred.secondary_text}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center justify-between px-3.5 py-2 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <Navigation className="w-3 h-3 text-blue-500" />
              Real-time Google Maps suggestions
            </span>
            <span>Select to fill</span>
          </div>
        </div>
      )}
    </div>
  );
}
