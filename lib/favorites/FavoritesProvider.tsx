"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useSession } from "next-auth/react";
import {
  getUserFavorites,
  toggleFavorite as toggleFavoriteAction,
} from "@/app/actions/favorite.actions";

const GUEST_FAVORITES_KEY = "guest-favorites";

function loadGuestFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(GUEST_FAVORITES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map((id: unknown) => String(id)) : [];
  } catch {
    return [];
  }
}

function saveGuestFavorites(ids: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(GUEST_FAVORITES_KEY, JSON.stringify(ids));
}

type FavoritesContextType = {
  favoriteIds: Set<string>;
  isFavorited: (id: string) => boolean;
  toggleFavorite: (productId: string) => Promise<{ isFavorited: boolean }>;
  isLoading: boolean;
  isLoggedIn: boolean;
  getGuestFavoriteIds: () => string[];
};

const FavoritesContext = createContext<FavoritesContextType | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const isLoggedIn = status === "authenticated";

  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isLoggedIn) {
      getUserFavorites()
        .then((ids) => {
          queueMicrotask(() => setFavoriteIds(new Set(ids)));
        })
        .catch(console.error)
        .finally(() => {
          queueMicrotask(() => setIsLoading(false));
        });
    } else {
      const stored = new Set(loadGuestFavorites().map((id) => String(id)));
      queueMicrotask(() => {
        setFavoriteIds(stored);
        setIsLoading(false);
      });
    }
  }, [isLoggedIn]);

  const toggleFavorite = useCallback(
    async (productId: string): Promise<{ isFavorited: boolean }> => {
      const id = String(productId);

      if (isLoggedIn) {
        const result = await toggleFavoriteAction(id);
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          if (result.isFavorited) next.add(id);
          else next.delete(id);
          return next;
        });
        return result;
      } else {
        const current = new Set(loadGuestFavorites());
        const wasFavorited = current.has(id);
        const willBeFavorited = !wasFavorited;

        if (willBeFavorited) current.add(id);
        else current.delete(id);

        const nextIds = [...current];
        saveGuestFavorites(nextIds);
        setFavoriteIds(new Set(nextIds));

        return { isFavorited: willBeFavorited };
      }
    },
    [isLoggedIn],
  );

  const getGuestFavoriteIds = useCallback(() => {
    return loadGuestFavorites();
  }, []);

  const value: FavoritesContextType = {
    favoriteIds,
    isFavorited: (id: string) => favoriteIds.has(String(id)),
    toggleFavorite,
    isLoading,
    isLoggedIn,
    getGuestFavoriteIds,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used inside FavoritesProvider");
  return ctx;
}
