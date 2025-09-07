import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import type { VendorSummary } from "../types/vendor";

const STORAGE_KEY = "windborne-dynamic-vendors";

interface DynamicVendorsContextType {
  dynamicVendors: VendorSummary[];
  addDynamicVendor: (vendor: VendorSummary) => void;
  removeDynamicVendor: (ticker: string) => void;
  clearDynamicVendors: () => void;
}

const DynamicVendorsContext = createContext<
  DynamicVendorsContextType | undefined
>(undefined);

interface DynamicVendorsProviderProps {
  children: ReactNode;
}

export const DynamicVendorsProvider: React.FC<DynamicVendorsProviderProps> = ({
  children,
}) => {
  const [dynamicVendors, setDynamicVendors] = useState<VendorSummary[]>([]);

  // Load dynamic vendors from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setDynamicVendors(parsed);
      } catch (error) {
        console.error("Failed to parse stored dynamic vendors:", error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Save to localStorage whenever dynamicVendors changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dynamicVendors));
  }, [dynamicVendors]);

  const addDynamicVendor = (vendor: VendorSummary) => {
    setDynamicVendors((prev) => {
      // Remove if already exists (in case of refresh)
      const filtered = prev.filter((v) => v.ticker !== vendor.ticker);
      return [...filtered, vendor];
    });
  };

  const removeDynamicVendor = (ticker: string) => {
    setDynamicVendors((prev) => prev.filter((v) => v.ticker !== ticker));
  };

  const clearDynamicVendors = () => {
    setDynamicVendors([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value: DynamicVendorsContextType = {
    dynamicVendors,
    addDynamicVendor,
    removeDynamicVendor,
    clearDynamicVendors,
  };

  return (
    <DynamicVendorsContext.Provider value={value}>
      {children}
    </DynamicVendorsContext.Provider>
  );
};

export const useDynamicVendors = (): DynamicVendorsContextType => {
  const context = useContext(DynamicVendorsContext);
  if (context === undefined) {
    throw new Error(
      "useDynamicVendors must be used within a DynamicVendorsProvider"
    );
  }
  return context;
};
