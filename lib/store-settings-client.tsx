"use client";

import React, { createContext, useContext } from "react";

export type StoreSettingsClientValue = {
  currency: string;
  sizeSystem: string;
};

const StoreSettingsContext = createContext<StoreSettingsClientValue>({
  currency: "USD",
  sizeSystem: "US",
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
