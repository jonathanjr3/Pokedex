import type { ColorPalette } from "./colors";

interface SpeciesColorVariations {
	light: string;
	dark: string;
}

// Map species color names to light/dark variations
const speciesColorMap: Record<string, SpeciesColorVariations> = {
	red: { light: "#FFCDD2", dark: "#E57373" },
	blue: { light: "#BBDEFB", dark: "#64B5F6" },
	green: { light: "#C8E6C9", dark: "#81C784" },
	yellow: { light: "#FFF9C4", dark: "#FFF176" },
	purple: { light: "#E1BEE7", dark: "#BA68C8" },
	pink: { light: "#F8BBD0", dark: "#F06292" },
	brown: { light: "#D7CCC8", dark: "#A1887F" },
	black: { light: "#CFD8DC", dark: "#546E7A" },
	gray: { light: "#E0E0E0", dark: "#757575" },
	white: { light: "#FAFAFA", dark: "#424242" },
};

/**
 * Gets an appropriate background color based on Pokemon species color and theme.
 * @param speciesColorName The color name from the PokemonSpecies endpoint (e.g., "red").
 * @param theme The current theme object (used to determine light/dark mode).
 * @returns A hex color string or the default theme background color.
 */
export const getBackgroundColorFromSpecies = (
	speciesColorName: string | undefined | null,
	theme: ColorPalette,
): string => {
	if (!speciesColorName) {
		return theme.background; // Fallback to default theme background
	}

	const colorVariations = speciesColorMap[speciesColorName.toLowerCase()];

	if (!colorVariations) {
		return theme.background; // Fallback if color name is not mapped
	}

	// Determine if the current theme is dark based on its background color
	const isDarkMode = theme.background === "#000000"; // Check against darkColors.background

	return isDarkMode ? colorVariations.dark : colorVariations.light;
};

const primarySpeciesColorHexMap: Record<string, string> = {
	red: "#F44336",
	blue: "#2196F3",
	green: "#4CAF50",
	yellow: "#FFEB3B",
	purple: "#9C27B0",
	pink: "#E91E63",
	brown: "#795548",
	black: "#212121",
	gray: "#9E9E9E",
	white: "#E0E0E0",
};

/**
 * Gets a primary hex color code based on Pokemon species color name.
 * @param speciesColorName The color name from the PokemonSpecies endpoint (e.g., "red").
 * @param fallbackColor A fallback hex color string (e.g., theme.primary).
 * @returns A hex color string.
 */
export const getPokemonColorHex = (
	speciesColorName: string | undefined | null,
	fallbackColor = "#9E9E9E", // Default fallback to Grey 500
): string => {
	if (!speciesColorName) {
		return fallbackColor;
	}
	const colorHex = primarySpeciesColorHexMap[speciesColorName.toLowerCase()];
	return colorHex || fallbackColor; // Return mapped color or the fallback
};
