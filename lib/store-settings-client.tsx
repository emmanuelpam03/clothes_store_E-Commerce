"use client";

import React, { createContext, useContext } from "react";

export type StoreSettingsClientValue = {
  currency: string;
  sizeSystem: string;
  baseCurrency: string;
  fxRate: number;
};

const StoreSettingsContext = createContext<StoreSettingsClientValue>({
  currency: "USD",
  sizeSystem: "US",
  baseCurrency: "USD",
  fxRate: 1,
});

export function StoreSettingsProvider({
  value,
  children,
}: {
  value: StoreSettingsClientValue;
  children: React.ReactNode;
}) {
  return (
    <StoreSettingsContext.Provider value={value}>
      {children}
    </StoreSettingsContext.Provider>
  );
}

export function useStoreSettings() {
  return useContext(StoreSettingsContext);
}
