export const pokemonTypeColors: { [key: string]: string } = {
	normal: "#A8A77A",
	fire: "#EE8130",
	water: "#6390F0",
	electric: "#F7D02C",
	grass: "#7AC74C",
	ice: "#96D9D6",
	fighting: "#C22E28",
	poison: "#A33EA1",
	ground: "#E2BF65",
	flying: "#A98FF3",
	psychic: "#F95587",
	bug: "#A6B91A",
	rock: "#B6A136",
	ghost: "#735797",
	dragon: "#6F35FC",
	dark: "#705746",
	steel: "#B7B7CE",
	fairy: "#D685AD",
};

// Define icon type
export type PokemonIconData = { name: string; library: string } | null;

export const pokemonTypeIcons: { [key: string]: PokemonIconData } = {
	normal: null,
	fire: { name: "fire", library: "MaterialCommunityIcons" },
	water: { name: "water-drop", library: "MaterialIcons" },
	electric: { name: "electric-bolt", library: "MaterialIcons" },
	grass: { name: "grass", library: "MaterialIcons" },
	ice: { name: "snowflake", library: "MaterialCommunityIcons" },
	fighting: { name: "hand-fist", library: "FontAwesome6" },
	poison: { name: "nuclear", library: "Ionicons" },
	ground: { name: "landscape", library: "MaterialIcons" },
	flying: { name: "airplane-takeoff", library: "MaterialCommunityIcons" },
	psychic: { name: "psychology", library: "MaterialIcons" },
	bug: { name: "bug-report", library: "MaterialIcons" },
	rock: { name: "terrain", library: "MaterialIcons" },
	ghost: { name: "ghost", library: "MaterialCommunityIcons" },
	dragon: { name: "dragon", library: "FontAwesome6" },
	dark: { name: "dark-mode", library: "MaterialIcons" },
	steel: { name: "shield-half-full", library: "MaterialCommunityIcons" },
	fairy: { name: "magic-staff", library: "MaterialCommunityIcons" },
};

export const getPokemonTypeColor = (type: string): string => {
	return pokemonTypeColors[type.toLowerCase()] || "#CCCCCC"; // Fallback color
};

export const getPokemonTypeIcon = (type: string): PokemonIconData => {
	return pokemonTypeIcons[type.toLowerCase()] || null;
};

// --- New Color Brightness Logic ---

const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
	const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
	const hexModified: string = hex.replace(shorthandRegex, (m, r, g, b) => {
		return r + r + g + g + b + b;
	});

	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexModified);
	return result
		? {
				r: Number.parseInt(result[1], 16),
				g: Number.parseInt(result[2], 16),
				b: Number.parseInt(result[3], 16),
			}
		: null;
};

export const isColorLight = (hexColor: string): boolean => {
	const rgb = hexToRgb(hexColor);
	if (!rgb) {
		// Default to assuming light background for unknown colors -> use dark text
		return true;
	}
	// Calculate perceived luminance (YIQ formula)
	const luminance = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
	// Consider colors with luminance >= 128 as "light"
	return luminance >= 128;
};
