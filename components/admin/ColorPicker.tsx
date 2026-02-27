"use client";

import { useState } from "react";
import { HexColorPicker } from "react-colorful";
import { Plus, X } from "lucide-react";

// Expanded predefined color palette
const PREDEFINED_COLORS = [
  { name: "Black", value: "#111827" },
  { name: "White", value: "#ffffff" },
  { name: "Gray", value: "#9ca3af" },
  { name: "Light Gray", value: "#d1d5db" },
  { name: "Dark Gray", value: "#4b5563" },
  { name: "Navy", value: "#1e3a8a" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Sky Blue", value: "#0ea5e9" },
  { name: "Light Blue", value: "#bfdbfe" },
  { name: "Royal Blue", value: "#1e40af" },
  { name: "Red", value: "#ef4444" },
  { name: "Dark Red", value: "#dc2626" },
  { name: "Burgundy", value: "#7f1d1d" },
  { name: "Pink", value: "#ec4899" },
  { name: "Light Pink", value: "#fbcfe8" },
  { name: "Rose", value: "#f43f5e" },
  { name: "Green", value: "#22c55e" },
  { name: "Dark Green", value: "#15803d" },
  { name: "Olive", value: "#84cc16" },
  { name: "Emerald", value: "#10b981" },
  { name: "Teal", value: "#14b8a6" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Purple", value: "#a855f7" },
  { name: "Violet", value: "#8b5cf6" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Lavender", value: "#c4b5fd" },
  { name: "Yellow", value: "#facc15" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Orange", value: "#f97316" },
  { name: "Coral", value: "#fb7185" },
  { name: "Brown", value: "#92400e" },
  { name: "Tan", value: "#d97706" },
  { name: "Beige", value: "#d6d3d1" },
  { name: "Cream", value: "#fef3c7" },
  { name: "Ivory", value: "#fffbeb" },
  { name: "Mint", value: "#d1fae5" },
  { name: "Peach", value: "#fed7aa" },
  { name: "Lilac", value: "#e9d5ff" },
  { name: "Khaki", value: "#a8a29e" },
  { name: "Charcoal", value: "#374151" },
];

interface ColorPickerProps {
  selectedColors: string[];
  onChange: (colors: string[]) => void;
}

/**
 * Parse a color string to extract name and hex value
 * Format: "Name:#hex" or just "#hex"
 */
export const parseColor = (color: string): { name: string; value: string } => {
  if (color.includes(":")) {
    const [name, value] = color.split(":");
    return { name, value };
  }
  // If no colon, it's just a hex value
  return { name: color, value: color };
};

/**
 * Format a color for storage
 * Returns "Name:#hex" format
 */
export const formatColor = (name: string, value: string): string => {
  return `${name}:${value}`;
};

export default function ColorPicker({
  selectedColors,
  onChange,
}: ColorPickerProps) {
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [customColor, setCustomColor] = useState("#3b82f6");
  const [customColorName, setCustomColorName] = useState("");

  const handleToggleColor = (name: string, value: string) => {
    const formattedColor = formatColor(name, value);
    if (selectedColors.includes(formattedColor)) {
      onChange(selectedColors.filter((c) => c !== formattedColor));
    } else {
      onChange([...selectedColors, formattedColor]);
    }
  };

  const handleAddCustomColor = () => {
    if (!customColor) return;

    // Use custom name if provided, otherwise use hex value
    const name = customColorName.trim() || customColor;
    const formattedColor = formatColor(name, customColor);

    // Check if color already exists (by hex value)
    const existingColor = selectedColors.find((c) => {
      const parsed = parseColor(c);
      return parsed.value.toLowerCase() === customColor.toLowerCase();
    });

    if (existingColor) {
      setShowCustomPicker(false);
      setCustomColorName("");
      return;
    }

    onChange([...selectedColors, formattedColor]);
    setShowCustomPicker(false);
    setCustomColorName("");
    setCustomColor("#3b82f6");
  };

  const handleRemoveColor = (color: string) => {
    onChange(selectedColors.filter((c) => c !== color));
  };

  // Check if a predefined color is selected
  const isColorSelected = (value: string): boolean => {
    return selectedColors.some((c) => {
      const parsed = parseColor(c);
      return parsed.value.toLowerCase() === value.toLowerCase();
    });
  };

  return (
    <div className="space-y-4">
      {/* Selected Colors */}
      {selectedColors.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-lg">
          <p className="w-full text-xs font-medium text-slate-600 mb-1">
            Selected Colors:
          </p>
          {selectedColors.map((color) => {
            const parsed = parseColor(color);
            return (
              <div
                key={color}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-md"
              >
                <div
                  className="w-5 h-5 rounded border border-slate-300"
                  style={{ backgroundColor: parsed.value }}
                />
                <span className="text-sm text-slate-700">{parsed.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveColor(color)}
                  className="ml-1 text-slate-400 hover:text-red-500 transition"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Predefined Color Swatches */}
      <div>
        <p className="text-sm font-medium text-slate-700 mb-3">
          Choose from predefined colors:
        </p>
        <div className="grid grid-cols-8 gap-2">
          {PREDEFINED_COLORS.map((color) => {
            const isSelected = isColorSelected(color.value);
            return (
              <button
                key={color.value}
                type="button"
                onClick={() => handleToggleColor(color.name, color.value)}
                title={color.name}
                className={`relative w-10 h-10 rounded-lg border-2 transition-all ${
                  isSelected
                    ? "border-blue-500 ring-2 ring-blue-200 scale-105"
                    : "border-slate-300 hover:border-slate-400 hover:scale-105"
                }`}
                style={{ backgroundColor: color.value }}
              >
                {isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3 h-3 bg-blue-600 rounded-full border-2 border-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Color Picker */}
      <div className="pt-2 border-t border-slate-200">
        {!showCustomPicker ? (
          <button
            type="button"
            onClick={() => setShowCustomPicker(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
          >
            <Plus size={16} />
            Add Custom Color
          </button>
        ) : (
          <div className="space-y-3 p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-700">Custom Color</p>
              <button
                type="button"
                onClick={() => {
                  setShowCustomPicker(false);
                  setCustomColorName("");
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex gap-4">
              <div className="shrink-0">
                <HexColorPicker color={customColor} onChange={setCustomColor} />
              </div>

              <div className="flex-1 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Color Preview
                  </label>
                  <div
                    className="w-full h-12 rounded border-2 border-slate-300"
                    style={{ backgroundColor: customColor }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Hex Value
                  </label>
                  <input
                    type="text"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="#3b82f6"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Color Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={customColorName}
                    onChange={(e) => setCustomColorName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Navy Blue"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddCustomColor}
                  className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition"
                >
                  Add Color
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
