"use client";

import React, { useState, useRef, useEffect } from "react";
import { COUNTRY_CODES } from "@/components/prelaunch/countries";
import { PencilIcon } from "@heroicons/react/24/outline";

interface PhoneNumberInputProps {
  value?: string; // "+880123456789"
  onChange?: (value: string) => void;
  disabled?: boolean;
}

export default function PhoneNumberInput({
  value = "",
  onChange,
  disabled = false,
}: PhoneNumberInputProps) {
  const [isCountryCodeOpen, setIsCountryCodeOpen] = useState(false);
  const countryCodeRef = useRef<HTMLDivElement>(null);

  // Parse initial value into code and number
  let initCode = "+1";
  let initNum = value || "";
  const matchedCountry = COUNTRY_CODES.find((c) => value.startsWith(c.code));
  if (matchedCountry) {
    initCode = matchedCountry.code;
    initNum = value.substring(matchedCountry.code.length).trim();
  }

  const [countryCode, setCountryCode] = useState(initCode);
  const [number, setNumber] = useState(initNum);

  useEffect(() => {
    let newCode = "+1";
    let newNum = value || "";
    const match = COUNTRY_CODES.find((c) => value.startsWith(c.code));
    if (match) {
      newCode = match.code;
      newNum = value.substring(match.code.length).trim();
    }
    setCountryCode(newCode);
    setNumber(newNum);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        countryCodeRef.current &&
        !countryCodeRef.current.contains(event.target as Node)
      ) {
        setIsCountryCodeOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCountryChange = (code: string) => {
    setCountryCode(code);
    setIsCountryCodeOpen(false);
    if (onChange) onChange(`${code}${number}`);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^\d\s()\-]/g, "");
    setNumber(val);
    if (onChange) onChange(`${countryCode}${val}`);
  };

  return (
    <div
      className={`flex relative rounded-md border transition-all duration-200 outline-none w-full
        ${
          disabled
            ? "bg-primary-bg/50 border-white/5 cursor-not-allowed"
            : "bg-white/5 border-white/10 hover:border-brand-primary/40 focus-within:ring-2 focus-within:ring-brand-primary/40 focus-within:border-brand-primary"
        }
      `}
    >
      {/* Country Selector Trigger */}
      <div className="relative shrink-0 flex items-stretch" ref={countryCodeRef}>
        <div
          className={`flex items-center gap-2 px-3 py-3 select-none border-r border-white/10 transition-colors rounded-l-md ${
            disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-white/5"
          }`}
          onClick={() => {
            if (!disabled) setIsCountryCodeOpen(!isCountryCodeOpen);
          }}
        >
          <span className="text-base leading-none">
            {COUNTRY_CODES.find((c) => c.code === countryCode)?.flag || "🏳️"}
          </span>
          <span className="text-white text-sm font-medium leading-none whitespace-nowrap">
            {countryCode}
          </span>
          {!disabled && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
              className={`w-3.5 h-3.5 ml-1 text-muted-text transition-transform duration-200 shrink-0 ${
                isCountryCodeOpen ? "rotate-180" : ""
              }`}
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M6 8l4 4 4-4"
              />
            </svg>
          )}
        </div>

        {/* Dropdown */}
        <div
          className={`absolute z-50 w-[240px] bg-[#121212] border border-white/10 rounded-md shadow-xl overflow-hidden transition-all duration-200 top-full mt-2 origin-top left-0 ${
            isCountryCodeOpen
              ? "opacity-100 scale-y-100"
              : "opacity-0 scale-y-0 pointer-events-none"
          }`}
        >
          <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent w-full">
            {COUNTRY_CODES.map((country) => (
              <div
                key={country.code}
                className={`px-3 py-2 text-sm flex items-center gap-2 cursor-pointer transition-colors ${
                  countryCode === country.code
                    ? "bg-brand-primary text-white font-medium"
                    : "text-white hover:bg-white/5"
                }`}
                onClick={() => handleCountryChange(country.code)}
              >
                <span className="text-base shrink-0">{country.flag}</span>
                <span className="truncate">
                  {country.name} ({country.code})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center pr-3">
        <input
          type="tel"
          disabled={disabled}
          placeholder="800 000 0000"
          value={number}
          onChange={handleNumberChange}
          className="flex-1 min-w-0 bg-transparent border-none outline-none text-white text-sm px-4 py-3 placeholder-muted-text rounded-r-md focus:ring-0 disabled:cursor-not-allowed"
        />
        {!disabled && <PencilIcon className="w-4 h-4 text-muted-text shrink-0" />}
      </div>
    </div>
  );
}
