"use client";

import { useState } from "react";
import { HexColorPicker } from "react-colorful";
import { Plus, X } from "lucide-react";
import {
  PREDEFINED_COLORS,
  formatStoredColor,
  parseStoredColor,
} from "@/lib/colors";

interface ColorPickerProps {
  selectedColors: string[];
  onChange: (colors: string[]) => void;
  id?: string;
}

export default function ColorPicker({
  selectedColors,
  onChange,
  id,
}: ColorPickerProps) {
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [customColor, setCustomColor] = useState("#3b82f6");
  const [customColorName, setCustomColorName] = useState("");
  const [customColorError, setCustomColorError] = useState("");

  const handleToggleColor = (name: string, value: string) => {
    const formattedColor = formatStoredColor(name, value);
    if (selectedColors.includes(formattedColor)) {
      onChange(selectedColors.filter((c) => c !== formattedColor));
    } else {
      onChange([...selectedColors, formattedColor]);
    }
  };

  const handleAddCustomColor = () => {
    if (!customColor) return;

    // Clear previous error
    setCustomColorError("");

    // Validate hex format
    const hexRegex = /^#?([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/;
    const normalizedColor = customColor.trim();

    if (!hexRegex.test(normalizedColor)) {
      setCustomColorError("Invalid hex color. Use format: #RRGGBB or #RGB");
      return;
    }

    // Ensure hex has # prefix
    const validHex = normalizedColor.startsWith("#")
      ? normalizedColor
      : `#${normalizedColor}`;

    // Check if color already exists (by hex value)
    const existingColor = selectedColors.find((c) => {
      const parsed = parseStoredColor(c);
      return parsed.value.toLowerCase() === validHex.toLowerCase();
    });

    if (existingColor) {
      const parsed = parseStoredColor(existingColor);
      setCustomColorError(`Color already added as "${parsed.name}"`);
      return;
    }

    // Use custom name if provided, otherwise use hex value
    const name = customColorName.trim() || validHex;
    const formattedColor = formatStoredColor(name, validHex);

    onChange([...selectedColors, formattedColor]);

    // Reset state only after successful addition
    setShowCustomPicker(false);
    setCustomColorName("");
    setCustomColor("#3b82f6");
    setCustomColorError("");
  };

  const handleRemoveColor = (color: string) => {
    onChange(selectedColors.filter((c) => c !== color));
  };

  // Check if a predefined color is selected
  const isColorSelected = (value: string): boolean => {
    return selectedColors.some((c) => {
      const parsed = parseStoredColor(c);
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
            const parsed = parseStoredColor(color);
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
          {PREDEFINED_COLORS.map((color, index) => {
            const isSelected = isColorSelected(color.value);
            return (
              <button
                key={color.value}
                id={index === 0 ? id : undefined}
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
                  setCustomColorError("");
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex gap-4">
              <div className="shrink-0">
                <HexColorPicker
                  color={customColor}
                  onChange={(color) => {
                    setCustomColor(color);
                    setCustomColorError("");
                  }}
                />
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
                    onChange={(e) => {
                      setCustomColor(e.target.value);
                      setCustomColorError("");
                    }}
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

                {customColorError && (
                  <div className="px-3 py-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
                    {customColorError}
                  </div>
                )}

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
