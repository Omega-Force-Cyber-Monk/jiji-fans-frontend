import { useState, useCallback } from "react";

export function generateUUID() {
  if (typeof window !== "undefined" && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function useIdempotency() {
  const [idempotencyKey, setIdempotencyKey] = useState<string>(() => generateUUID());

  const regenerateKey = useCallback(() => {
    const newKey = generateUUID();
    setIdempotencyKey(newKey);
    return newKey;
  }, []);

  return {
    idempotencyKey,
    regenerateKey,
  };
}
