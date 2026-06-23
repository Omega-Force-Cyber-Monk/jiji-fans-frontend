"use client";

import React, { useState, useId, useRef, useEffect } from "react";
import { WaitlistEntry } from "./waitlist.types";
import { TCategory } from "@/redux/features/category/category.api";
import { useAppContext } from "@/lib/providers/ContextProvider";
import { COUNTRY_CODES } from "./countries";

interface WaitlistFormProps {
  categories: TCategory[];
  onSubmit: (entry: WaitlistEntry) => void | Promise<void>;
}

type FormState = {
  name: string;
  email: string;
  whatsapp: string;
  category: string;
  countryCode: string;
};

const INITIAL_FORM: FormState = {
  name: "",
  email: "",
  whatsapp: "",
  category: "",
  countryCode: "+234",
};

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function WaitlistForm({ categories, onSubmit }: WaitlistFormProps) {
  const formId = useId();
  const { messageApi } = useAppContext();
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [loading, setLoading] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isCountryCodeOpen, setIsCountryCodeOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');
  const categoryRef = useRef<HTMLDivElement>(null);
  const countryCodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isCategoryOpen && categoryRef.current) {
      const rect = categoryRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const expectedHeight = 300; // Approx max-h-60 (240px) + padding

      if (spaceBelow < expectedHeight && spaceAbove > spaceBelow) {
        setDropdownPosition('top');
      } else {
        setDropdownPosition('bottom');
      }
    }
  }, [isCategoryOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
      if (countryCodeRef.current && !countryCodeRef.current.contains(event.target as Node)) {
        setIsCountryCodeOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const validate = (): boolean => {
    const newErrors: Partial<FormState> = {};
    if (!form.name.trim()) newErrors.name = "Name is required.";
    if (!form.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Enter a valid email address.";
    }
    if (!form.category) newErrors.category = "Please select a creator category.";

    if (!form.whatsapp?.trim()) {
      newErrors.whatsapp = "WhatsApp number is required.";
    } else {
      const selectedCountry = COUNTRY_CODES.find((c) => c.code === form.countryCode);
      const phoneDigits = form.whatsapp.replace(/\D/g, "");
      if (selectedCountry) {
        if (phoneDigits.length !== selectedCountry.length) {
          newErrors.whatsapp = `Number must be ${selectedCountry.length} digits.`;
        }
      } else if (!/^\+?[\d\s\-()]{7,20}$/.test(form.whatsapp)) {
        newErrors.whatsapp = "Enter a valid WhatsApp number.";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailValidation = () => {
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setErrors((prev) => ({ ...prev, email: "Enter a valid email address." }));
    } else if (errors.email) {
      setErrors((prev) => ({ ...prev, email: undefined }));
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name as keyof FormState]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const entry: WaitlistEntry = {
        id: generateId(),
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        whatsapp: form.whatsapp.trim() ? `${form.countryCode} ${form.whatsapp.trim()}` : undefined,
        category: form.category,
        submittedAt: new Date().toISOString(),
      };

      await onSubmit(entry);
      setForm(INITIAL_FORM);
      setErrors({});
    } catch (error: any) {
      // Show toast on catch
      messageApi.error(error?.data?.message || error?.message || "Failed to join waitlist. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Input base class ──────────────────────────────────────────────────────
  const inputBase =
    "w-full px-4 py-3 rounded-md text-sm font-normal text-white placeholder-muted-text bg-white/5 border transition-all duration-200 outline-none focus:ring-2 focus:ring-brand-primary/40";
  const inputNormal = `${inputBase} border-white/10 hover:border-brand-primary/40 focus:border-brand-primary`;
  const inputError = `${inputBase} border-error/60 focus:border-error focus:ring-error/20`;

  return (
    <form id={`${formId}-form`} onSubmit={handleSubmit} noValidate>
      <div className="flex flex-col gap-4">
        {/* Name */}
        <div>
          <label
            htmlFor={`${formId}-name`}
            className="block text-sm font-medium text-muted-text mb-2"
          >
            Full Name <span className="text-error">*</span>
          </label>
          <input
            id={`${formId}-name`}
            name="name"
            type="text"
            autoComplete="name"
            placeholder="e.g. Amara Diallo"
            value={form.name}
            onChange={handleChange}
            className={errors.name ? inputError : inputNormal}
          />
          {errors.name && (
            <p className="mt-1.5 text-xs text-error font-normal">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor={`${formId}-email`}
            className="block text-sm font-medium text-muted-text mb-2"
          >
            Email Address <span className="text-error">*</span>
          </label>
          <input
            id={`${formId}-email`}
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            onBlur={handleEmailValidation}
            onMouseLeave={handleEmailValidation}
            className={errors.email ? inputError : inputNormal}
          />
          {errors.email && (
            <p className="mt-1.5 text-xs text-error font-normal">{errors.email}</p>
          )}
        </div>

        {/* WhatsApp */}
        <div>
          <label
            htmlFor={`${formId}-whatsapp`}
            className="block text-sm font-medium text-muted-text mb-2"
          >
            WhatsApp Number <span className="text-error">*</span>
          </label>
          <div
            className={`flex relative rounded-md bg-white/5 border transition-all duration-200 outline-none focus-within:ring-2 focus-within:ring-brand-primary/40 focus-within:border-brand-primary ${errors.whatsapp ? 'border-error/60 focus-within:border-error focus-within:ring-error/20' : 'border-white/10 hover:border-brand-primary/40'}`}
          >
            {/* Country Selector Trigger */}
            <div className="relative shrink-0 flex items-stretch" ref={countryCodeRef}>
              <div
                className="flex items-center gap-2 px-3 py-3 cursor-pointer select-none border-r border-white/10 hover:bg-white/5 transition-colors rounded-l-md"
                onClick={() => setIsCountryCodeOpen(!isCountryCodeOpen)}
              >
                <span className="text-base leading-none">
                  {COUNTRY_CODES.find((c) => c.code === form.countryCode)?.flag || "🏳️"}
                </span>
                <span className="text-white text-sm font-medium leading-none whitespace-nowrap">
                  {form.countryCode}
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                  className={`w-3.5 h-3.5 ml-1 text-muted-text transition-transform duration-200 shrink-0 ${isCountryCodeOpen ? "rotate-180" : ""}`}
                >
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 8l4 4 4-4" />
                </svg>
              </div>

              <div
                className={`absolute z-50 w-[240px] bg-[#121212] border border-white/10 rounded-md shadow-xl overflow-hidden transition-all duration-200 top-full mt-2 origin-top left-0 ${isCountryCodeOpen ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0 pointer-events-none"}`}
              >
                <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent w-full">
                  {COUNTRY_CODES.map((country) => (
                    <div
                      key={country.code}
                      className={`px-3 py-2 text-sm flex items-center gap-2 cursor-pointer transition-colors ${form.countryCode === country.code ? 'bg-brand-primary text-white font-medium' : 'text-white hover:bg-white/5'}`}
                      onClick={() => {
                        setForm((prev) => ({ ...prev, countryCode: country.code }));
                        if (errors.whatsapp) {
                          setErrors((prev) => ({ ...prev, whatsapp: undefined }));
                        }
                        setIsCountryCodeOpen(false);
                      }}
                    >
                      <span className="text-base shrink-0">{country.flag}</span>
                      <span className="truncate">{country.name} ({country.code})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <input
              id={`${formId}-whatsapp`}
              name="whatsapp"
              type="tel"
              autoComplete="tel"
              placeholder="800 000 0000"
              value={form.whatsapp}
              onChange={(e) => {
                const val = e.target.value.replace(/[^\d\s]/g, "");
                const country = COUNTRY_CODES.find(c => c.code === form.countryCode);
                const limit = country?.length || 20;

                let digitCount = 0;
                let truncatedVal = "";
                let limitExceeded = false;
                for (let i = 0; i < val.length; i++) {
                  if (/\d/.test(val[i])) {
                    if (digitCount < limit) {
                      truncatedVal += val[i];
                      digitCount++;
                    } else {
                      limitExceeded = true;
                    }
                  } else {
                    truncatedVal += val[i];
                  }
                }

                setForm(prev => ({ ...prev, whatsapp: truncatedVal }));
                if (limitExceeded) {
                  setErrors((prev) => ({ ...prev, whatsapp: `Maximum ${limit} digits allowed for ${country?.name || form.countryCode}.` }));
                } else if (errors.whatsapp) {
                  setErrors((prev) => ({ ...prev, whatsapp: undefined }));
                }
              }}
              className="flex-1 min-w-0 bg-transparent border-none outline-none text-white text-sm px-4 py-3 placeholder-muted-text rounded-r-md focus:ring-0"
            />
          </div>
          {errors.whatsapp && (
            <p className="mt-1.5 text-xs text-error font-normal">{errors.whatsapp}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label
            htmlFor={`${formId}-category`}
            className="block text-sm font-medium text-muted-text mb-2"
          >
            Creator Category <span className="text-error">*</span>
          </label>
          <div className="relative" ref={categoryRef}>
            <div
              id={`${formId}-category`}
              className={`${errors.category ? inputError : inputNormal} cursor-pointer flex items-center justify-between select-none`}
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
            >
              <span className={form.category ? "text-white" : "text-muted-text"}>
                {form.category
                  ? categories.find((c) => c._id === form.category)?.name
                  : "Select your category..."}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
                className={`w-5 h-5 text-muted-text transition-transform duration-200 ${isCategoryOpen ? "rotate-180" : ""}`}
              >
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 8l4 4 4-4" />
              </svg>
            </div>

            <div
              className={`absolute z-50 w-full bg-[#121212] border border-white/10 rounded-md shadow-xl overflow-hidden transition-all duration-200 ${dropdownPosition === 'top' ? 'bottom-full mb-2 origin-bottom' : 'top-full mt-2 origin-top'} ${isCategoryOpen ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0 pointer-events-none"}`}
            >
              <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent w-full">
                <div
                  className="px-4 py-2 text-sm text-muted-text hover:bg-white/5 cursor-pointer transition-colors"
                  onClick={() => {
                    setForm((prev) => ({ ...prev, category: "" }));
                    setIsCategoryOpen(false);
                  }}
                >
                  Select your category...
                </div>
                {categories.map((cat) => (
                  <div
                    key={cat._id}
                    className={`px-4 py-2 text-sm cursor-pointer transition-colors ${form.category === cat._id ? 'bg-brand-primary text-white font-medium' : 'text-white hover:bg-white/5'}`}
                    onClick={() => {
                      setForm((prev) => ({ ...prev, category: cat._id }));
                      if (errors.category) {
                        setErrors((prev) => ({ ...prev, category: undefined }));
                      }
                      setIsCategoryOpen(false);
                    }}
                  >
                    {cat.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
          {errors.category && (
            <p className="mt-1.5 text-xs text-error font-normal">{errors.category}</p>
          )}
        </div>

        {/* Submit */}
        <button
          id={`${formId}-submit`}
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-md bg-brand-primary text-white font-medium text-sm hover:bg-brand-secondary transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-brand-primary/25 hover:shadow-brand-primary/40 hover:scale-[1.01] active:scale-[0.99]"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              Joining…
            </span>
          ) : (
            "Join Creator Waitlist →"
          )}
        </button>

        <p className="text-center text-xs text-muted-text font-normal">
          No spam, ever. Unsubscribe any time.
        </p>
      </div>
    </form>
  );
}
