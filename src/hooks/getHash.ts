import { useEffect, useState } from "react";

const useGetHash = () => {
  const [hash, setHash] = useState<string | null>(null);

  useEffect(() => {
    // Set initial hash on mount
    const updateHash = () => {
      setHash(window.location.hash || null);
    };

    updateHash();

    // Listen for hash changes
    window.addEventListener("hashchange", updateHash);

    // Cleanup on unmount
    return () => {
      window.removeEventListener("hashchange", updateHash);
    };
  }, []);

  return hash;
};

export default useGetHash;