import { BlurView } from "@react-native-community/blur";
import type { Pokemon } from "pokenode-ts";
import type React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useTheme } from "../hooks/useTheme";
import {
	getPokemonTypeColor,
} from "../utils/PokemonTypeColors";
import { formatName } from "../utils/StringHelpers";
import { TypeBadge } from "./PokemonTypeBadge";

interface Props {
	pokemon: Pokemon;
	isLandscape: boolean;
	speciesHexColor: string | null;
}

const PokemonHeader: React.FC<Props> = ({
	pokemon,
	isLandscape,
	speciesHexColor,
}) => {
	const theme = useTheme();

	const mainSprite =
		pokemon.sprites?.other?.["official-artwork"]?.front_default ??
		pokemon.sprites?.front_default;

	const headerStyle = {
		borderBottomColor: theme.border,
		borderRightColor: theme.border,
	};
	const textStyle = { color: theme.text };
	const textMutedStyle = { color: theme.text, opacity: 0.7 };

	const typeHexColors = pokemon.types
		.map((typeInfo) => getPokemonTypeColor(typeInfo.type.name))
		.filter((color): color is string => !!color);

	const baseGradientColor = speciesHexColor ?? theme.primary;

	// Combine species color with type colors
	let calculatedGradientColors = [baseGradientColor, ...typeHexColors];

	// Ensure at least two colors for the gradient
	if (calculatedGradientColors.length < 2) {
		// If only one base color, add highlight as the second color
		calculatedGradientColors.push(theme.skeletonHighlight);
	}

	// Remove duplicates just in case
	calculatedGradientColors = [...new Set(calculatedGradientColors)];
	if (calculatedGradientColors.length < 2) {
		// Final fallback if duplicates made it too short
		calculatedGradientColors = [theme.primary, theme.skeletonHighlight];
	}

	const blurType = theme.background === "#000000" ? "dark" : "light";

	return (
		<View
			style={[
				styles.headerContainer,
				isLandscape && styles.headerContainerLandscape,
				headerStyle,
			]}
		>
			<LinearGradient
				colors={calculatedGradientColors}
				style={StyleSheet.absoluteFillObject}
			/>
			<BlurView
				style={StyleSheet.absoluteFillObject}
				blurType={blurType}
				blurAmount={10}
			/>
			<View style={styles.contentContainer}>
				{mainSprite ? (
					<Image
						style={
							isLandscape
								? styles.mainSpriteLandscape
								: styles.mainSpritePortrait
						}
						source={{ uri: mainSprite }}
						resizeMode="contain"
					/>
				) : (
					<View
						style={[
							isLandscape
								? styles.mainSpriteLandscape
								: styles.mainSpritePortrait,
							styles.spritePlaceholder,
						]}
					>
						<Text style={textStyle}>?</Text>
					</View>
				)}
				<Text style={[styles.name, textStyle]}>{formatName(pokemon.name)}</Text>
				<Text style={[styles.idText, textMutedStyle]}>
					#{pokemon.id.toString().padStart(3, "0")}
				</Text>
				<View style={styles.typesContainer}>
					{pokemon.types.map((typeInfo) => (
						<TypeBadge key={typeInfo.slot} typeName={typeInfo.type.name} />
					))}
				</View>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	headerContainer: {
		alignItems: "center",
		paddingTop: 10,
	},
	headerContainerLandscape: {
		justifyContent: "center",
		borderRadius: 12,
		marginVertical: 15,
		height: "100%",
		overflow: "hidden",
	},
	mainSpritePortrait: {
		width: 150,
		height: 150,
	},
	mainSpriteLandscape: {
		width: 120,
		height: 120,
	},
	spritePlaceholder: {
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#E0E0E0",
		borderRadius: 75,
	},
	name: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 4,
		textAlign: "center",
	},
	idText: {
		fontSize: 14,
		marginBottom: 10,
	},
	typesContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "center",
		marginBottom: 15,
	},
	contentContainer: {
		alignItems: "center",
		zIndex: 1,
	},
});

export default PokemonHeader;
