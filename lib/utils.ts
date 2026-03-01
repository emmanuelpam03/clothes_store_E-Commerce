import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a secure random temporary password using cryptographically secure RNG
 * Format: Tmp-XXXX-XXXX (e.g., "Tmp-X9k2-Pq7s")
 */
export function generateTemporaryPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const length1 = 4;
  const length2 = 4;

  const randomString = (length: number): string => {
    let result = "";
    const array = new Uint32Array(length);

    // Use Web Crypto API (available in Node.js 16+ and browsers)
    crypto.getRandomValues(array);

    for (let i = 0; i < length; i++) {
      // Use rejection sampling to avoid modulo bias
      const maxValid = Math.floor(0xffffffff / chars.length) * chars.length;
      let randomValue = array[i];

      // Rejection sampling: regenerate if value is in biased range
      while (randomValue >= maxValid) {
        const newArray = new Uint32Array(1);
        crypto.getRandomValues(newArray);
        randomValue = newArray[0];
      }

      result += chars.charAt(randomValue % chars.length);
    }
    return result;
  };

  return `Tmp-${randomString(length1)}-${randomString(length2)}`;
}
