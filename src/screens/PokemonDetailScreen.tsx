import type React from "react";
import { useLayoutEffect, useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	ActivityIndicator,
	useWindowDimensions,
	SafeAreaView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { useTheme } from "../hooks/useTheme";
import { formatName } from "../utils/StringHelpers";
import PokemonHeader from "../components/PokemonHeader";
import PokemonDetailsBody from "../components/PokemonDetailsBody";
import {
	getBackgroundColorFromSpecies,
	getPokemonColorHex,
} from "../styles/PokemonSpeciesColors";
import apiClient from "../api/PokeClient";
import type { PokemonSpecies, Type as PokemonTypeData } from "pokenode-ts";

type Props = NativeStackScreenProps<RootStackParamList, "PokemonDetail">;

const PokemonDetailScreen: React.FC<Props> = ({ route, navigation }) => {
	const { pokemon } = route.params;
	const theme = useTheme();
	const insets = useSafeAreaInsets();
	const { width, height } = useWindowDimensions();
	const isLandscape = width > height;
	const [species, setSpecies] = useState<PokemonSpecies | null>(null);
	const [typesData, setTypesData] = useState<PokemonTypeData[]>([]);
	const [isLoadingDetails, setIsLoadingDetails] = useState(true);
	const [errorDetails, setErrorDetails] = useState<string | null>(null);

	useLayoutEffect(() => {
		navigation.setOptions({
			title: formatName(pokemon?.name ?? ""),
		});
	}, [navigation, pokemon?.name]);

	useEffect(() => {
		if (!pokemon) {
			setIsLoadingDetails(false);
			return;
		}

		let isMounted = true;
		setIsLoadingDetails(true);
		setErrorDetails(null);

		const fetchDetails = async () => {
			try {
				console.log(`Fetching species and type data for: ${pokemon.name}`);
				const [speciesData, ...fetchedTypesData] = await Promise.all([
					apiClient.getPokemonSpeciesByName(pokemon.species.name),
					...pokemon.types.map((typeInfo) =>
						apiClient.getTypeByName(typeInfo.type.name),
					),
				]);

				if (isMounted) {
					console.log(`Species color: ${speciesData.color?.name}`);
					setSpecies(speciesData);
					setTypesData(fetchedTypesData);
					setIsLoadingDetails(false);
				}
			} catch (error) {
				console.error(`Failed to fetch details for ${pokemon.name}:`, error);
				if (isMounted) {
					setErrorDetails("Failed to load Pokémon details.");
					setIsLoadingDetails(false);
				}
			}
		};

		fetchDetails();
		return () => {
			isMounted = false;
		};
	}, [pokemon]);

	const speciesHexColor = getBackgroundColorFromSpecies(
		species?.color?.name,
		theme,
	);
	const statBarSpeciesColor =
		getPokemonColorHex(species?.color?.name) ?? theme.primary;

	const backgroundStyle = {
		backgroundColor: theme.background,
		flex: 1,
	};

	const containerStyle = {
		flex: 1,
		paddingBottom: insets.bottom,
		paddingLeft: insets.left,
		paddingRight: insets.right,
	};

	if (!pokemon || isLoadingDetails || errorDetails) {
		return (
			<SafeAreaView style={[styles.centerContainer, backgroundStyle]}>
				<View
					style={[
						containerStyle,
						{ justifyContent: "center", alignItems: "center" },
					]}
				>
					{isLoadingDetails ? (
						<ActivityIndicator size="large" color={theme.primary} />
					) : null}
					<Text style={{ color: theme.text, marginTop: 10 }}>
						{isLoadingDetails
							? "Loading Pokémon details..."
							: (errorDetails ?? "Could not load Pokémon.")}
					</Text>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={backgroundStyle}>
			<View style={containerStyle}>
				{isLandscape ? (
					<View style={styles.landscapeContainer}>
						<View style={styles.landscapeLeftColumn}>
							<PokemonHeader
								pokemon={pokemon}
								isLandscape={isLandscape}
								speciesHexColor={speciesHexColor}
							/>
						</View>
						<View style={styles.landscapeRightColumn}>
							<ScrollView
								showsVerticalScrollIndicator={false}
								contentContainerStyle={styles.scrollContainer}
							>
								<PokemonDetailsBody
									pokemon={pokemon}
									species={species}
									typesData={typesData}
									speciesHexColor={statBarSpeciesColor}
									isLandscape={isLandscape}
								/>
							</ScrollView>
						</View>
					</View>
				) : (
					<ScrollView
						contentContainerStyle={styles.scrollContainer}
						showsVerticalScrollIndicator={false}
					>
						<PokemonHeader
							pokemon={pokemon}
							isLandscape={isLandscape}
							speciesHexColor={speciesHexColor}
						/>
						<PokemonDetailsBody
							pokemon={pokemon}
							species={species}
							typesData={typesData}
							speciesHexColor={statBarSpeciesColor}
							isLandscape={isLandscape}
						/>
					</ScrollView>
				)}
			</View>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	centerContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	scrollContainer: {
		flexGrow: 1,
	},
	landscapeContainer: {
		flex: 1,
		flexDirection: "row",
	},
	landscapeLeftColumn: {
		width: "40%",
		paddingHorizontal: 5,
	},
	landscapeRightColumn: {
		flex: 1,
		marginHorizontal: 15,
	},
});

export default PokemonDetailScreen;
