"use client";

import { useState, useEffect, useCallback } from "react";
import { WaitlistEntry } from "./waitlist.types";

const STORAGE_KEY = "plus2fans_waitlist_v1";

function loadFromStorage(): WaitlistEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as WaitlistEntry[]) : [];
  } catch {
    return [];
  }
}

function saveToStorage(entries: WaitlistEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // quota exceeded or private mode — fail silently
  }
}

export function useWaitlistStore() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);

  // Hydrate from localStorage after mount
  useEffect(() => {
    setEntries(loadFromStorage());
  }, []);

  const addEntry = useCallback((entry: WaitlistEntry) => {
    setEntries((prev) => {
      const next = [entry, ...prev];
      saveToStorage(next);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setEntries([]);
    saveToStorage([]);
  }, []);

  return { entries, addEntry, clearAll };
}
