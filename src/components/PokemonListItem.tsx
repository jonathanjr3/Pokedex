import { useNavigation } from "@react-navigation/native";
import type { Pokemon, PokemonType } from "pokenode-ts";
import React, { useCallback } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../hooks/useTheme";
import type { PokemonListNavigationProp } from "../navigation/types";
import { formatName } from "../utils/StringHelpers";
import { TypeBadge } from "./PokemonTypeBadge";

interface Props {
	pokemon: Pokemon;
}

const PokemonListItem: React.FC<Props> = ({ pokemon }) => {
	const theme = useTheme();
	const navigation = useNavigation<PokemonListNavigationProp>();

	const handlePress = useCallback(() => {
		navigation.navigate("PokemonDetail", { pokemon: pokemon });
	}, [navigation, pokemon]);

	const spriteUri =
		pokemon.sprites?.other?.["official-artwork"]?.front_default ??
		pokemon.sprites?.front_default;

	const cardStyle = {
		backgroundColor: theme.card,
	};
	const textStyle = { color: theme.text };
	const mutedTextStyle = { color: theme.text, opacity: 0.6 }; // For ID

	const renderSprite = () => {
		if (!spriteUri) {
			return (
				<View style={[styles.sprite, styles.spritePlaceholder]}>
					<Text style={styles.placeholderText}>?</Text>
				</View>
			);
		}
		return (
			<Image
				style={styles.sprite}
				source={{ uri: spriteUri }}
				resizeMode="contain"
			/>
		);
	};

	return (
		<TouchableOpacity
			style={[styles.container, cardStyle]}
			onPress={handlePress}
			activeOpacity={0.7}
		>
			<Text style={[styles.idText, mutedTextStyle]}>
				#{pokemon.id.toString().padStart(4, "0")}
			</Text>

			<View style={styles.spriteContainer}>{renderSprite()}</View>

			<Text
				style={[styles.nameText, textStyle]}
				numberOfLines={1}
				ellipsizeMode="tail"
			>
				{formatName(pokemon.name)}
			</Text>

			<View style={styles.typesContainer}>
				{pokemon.types.map((typeInfo: PokemonType, index: number) => (
					<TypeBadge key={index} typeName={typeInfo.type.name} />
				))}
			</View>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: "column",
		alignItems: "center",
		padding: 10,
		margin: 5,
		borderRadius: 12,
		position: "relative",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	idText: {
		position: "absolute",
		top: 6,
		right: 8,
		fontSize: 11,
		fontWeight: "600",
	},
	spriteContainer: {
		width: "80%",
		aspectRatio: 1,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 8,
		marginTop: 15,
	},
	sprite: {
		width: "100%",
		height: "100%",
	},
	spritePlaceholder: {
		backgroundColor: "rgba(128,128,128,0.1)",
		borderRadius: 10,
		justifyContent: "center",
		alignItems: "center",
		width: "100%",
		height: "100%",
	},
	placeholderText: {
		fontSize: 30,
		color: "rgba(0,0,0,0.2)",
	},
	nameText: {
		fontSize: 15,
		fontWeight: "bold",
		textAlign: "center",
		marginBottom: 8,
	},
	typesContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "center",
		minHeight: 22, // Reserve space even if no types yet, prevents jump
	},
});

export default React.memo(PokemonListItem);
