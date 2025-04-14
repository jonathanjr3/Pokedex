import type {
	Pokemon,
	PokemonStat,
	Type as PokemonTypeData,
} from "pokenode-ts";
import type React from "react";
import { useMemo } from "react";
import {
	ScrollView,
	StyleSheet,
	Text,
	View,
	useColorScheme,
} from "react-native";
import { useTheme } from "../hooks/useTheme";
import { formatName } from "../utils/StringHelpers";
import { TypeBadge } from "./PokemonTypeBadge";
import { StatBar } from "./StatBar";

const styles = StyleSheet.create({
	sceneContainer: {
		padding: 15,
		flexGrow: 1,
	},
	sceneContainerLandscape: {
		paddingTop: 15,
		paddingHorizontal: 5,
		flexGrow: 1,
	},
	card: {
		borderRadius: 12,
		padding: 15,
		marginBottom: 15,
	},
	shadow: {
		// Shadow for light mode
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.15,
		shadowRadius: 3.84,
		elevation: 3,
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: "bold",
		marginBottom: 12,
	},
	statRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 10,
	},
	statLabel: { width: 65, fontSize: 12, textTransform: "capitalize" },
	statValue: { width: 35, fontSize: 13, textAlign: "right", fontWeight: "600" },
	statBarContainer: { flex: 1, height: 6, marginLeft: 8, marginRight: 0 },
	// Type Defenses Styles
	defenseSection: {
		marginBottom: 15,
	},
	defenseLabel: {
		fontSize: 13,
		fontWeight: "600",
		marginBottom: 8,
	},
	typeBadgeContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
	},
});

// Helper Functions
const formatStatName = (name: string): string => {
	switch (name) {
		case "hp":
			return "HP";
		case "attack":
			return "Attack";
		case "defense":
			return "Defense";
		case "special-attack":
			return "Sp. Atk";
		case "special-defense":
			return "Sp. Def";
		case "speed":
			return "Speed";
		default:
			return formatName(name);
	}
};

const calculateMaxStatValue = (baseStat: number, statName: string): number => {
	if (statName === "hp") {
		// HP Formula: BaseStat × 2 + 204
		return baseStat * 2 + 204;
	}
	// Other Stats Formula: ( BaseStat × 2 + 99 ) × 1.1 (rounded down)
	return Math.floor((baseStat * 2 + 99) * 1.1);
};

// Type effectiveness calculation
const calculateTypeEffectiveness = (
	typesData: PokemonTypeData[],
): { [key: string]: number } => {
	const effectivenessMap: { [key: string]: number } = {};

	// This is a simplified list, ideally fetched or predefined completely
	const allTypes = [
		"normal",
		"fighting",
		"flying",
		"poison",
		"ground",
		"rock",
		"bug",
		"ghost",
		"steel",
		"fire",
		"water",
		"grass",
		"electric",
		"psychic",
		"ice",
		"dragon",
		"dark",
		"fairy",
	];

	for (const t of allTypes) {
		effectivenessMap[t] = 1; // Initialize all types with multiplier 1
	}

	for (const type of typesData) {
		const relations = type.damage_relations;
		relations.double_damage_from.forEach(
			(t) => (effectivenessMap[t.name] *= 2),
		);
		relations.half_damage_from.forEach(
			(t) => (effectivenessMap[t.name] *= 0.5),
		);
		relations.no_damage_from.forEach((t) => (effectivenessMap[t.name] = 0));
	}

	return effectivenessMap;
};

export const StatsScene: React.FC<{
	pokemon: Pokemon;
	typesData: PokemonTypeData[];
	speciesHexColor: string;
	isLandscape: boolean;
}> = ({ pokemon, typesData, speciesHexColor, isLandscape }) => {
	const theme = useTheme();
	const colorScheme = useColorScheme();
	const isDarkMode = colorScheme === "dark";

	const textStyle = { color: theme.text };
	const cardStyle = [styles.card, { backgroundColor: theme.card }];
	const shadowStyle = isDarkMode ? {} : styles.shadow;

	const totalStats = useMemo(
		() => pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0),
		[pokemon.stats],
	);
	const typeEffectiveness = useMemo(
		() => calculateTypeEffectiveness(typesData),
		[typesData],
	);

	const defenses = useMemo(() => {
		const weak: string[] = [];
		const resistant: string[] = [];
		const immune: string[] = [];
		Object.entries(typeEffectiveness).forEach(([type, multiplier]) => {
			if (multiplier > 1) weak.push(type);
			else if (multiplier < 1) resistant.push(type);
			else if (multiplier === 0) immune.push(type);
		});
		weak.sort((a, b) => a.localeCompare(b));
		resistant.sort((a, b) => a.localeCompare(b));
		immune.sort((a, b) => a.localeCompare(b));
		return {
			weak: weak,
			resistant: resistant,
			immune: immune,
		};
	}, [typeEffectiveness]);

	return (
		<ScrollView
			contentContainerStyle={
				isLandscape ? styles.sceneContainerLandscape : styles.sceneContainer
			}
			showsVerticalScrollIndicator={false}
		>
			{/* Base Stats */}
			<View style={[cardStyle, shadowStyle]}>
				<Text style={[styles.sectionTitle, textStyle]}>Base Stats</Text>
				{pokemon.stats.map((statInfo: PokemonStat) => (
					<StatBar
						key={statInfo.stat.name}
						label={formatStatName(statInfo.stat.name)}
						value={statInfo.base_stat}
						color={speciesHexColor}
						maxValue={calculateMaxStatValue(
							statInfo.base_stat,
							statInfo.stat.name,
						)}
					/>
				))}
				<View style={styles.statRow}>
					<Text
						style={[
							styles.statLabel,
							{ color: theme.textMuted, fontWeight: "bold" },
						]}
					>
						Total
					</Text>
					<Text
						style={[
							styles.statValue,
							{ color: theme.text, fontWeight: "bold" },
						]}
					>
						{totalStats}
					</Text>
					<View style={styles.statBarContainer} />
				</View>
			</View>

			{/* Type Defenses */}
			<View style={[cardStyle, shadowStyle]}>
				<Text style={[styles.sectionTitle, textStyle]}>Type Defenses</Text>
				{defenses.weak.length > 0 && (
					<View style={styles.defenseSection}>
						<Text style={[styles.defenseLabel, textStyle]}>
							Weak Against (x
							{Math.max(
								...defenses.weak.map((t) => typeEffectiveness[t]),
							).toFixed(1)}{" "}
							damage):
						</Text>
						<View style={styles.typeBadgeContainer}>
							{defenses.weak.map((type) => (
								<TypeBadge key={type} typeName={type} />
							))}
						</View>
					</View>
				)}
				{defenses.resistant.length > 0 && (
					<View style={styles.defenseSection}>
						<Text style={[styles.defenseLabel, textStyle]}>
							Resistant To (x
							{Math.min(
								...defenses.resistant.map((t) => typeEffectiveness[t]),
							).toFixed(1)}{" "}
							damage):
						</Text>
						<View style={styles.typeBadgeContainer}>
							{defenses.resistant.map((type) => (
								<TypeBadge key={type} typeName={type} />
							))}
						</View>
					</View>
				)}
				{defenses.immune.length > 0 && (
					<View style={styles.defenseSection}>
						<Text style={[styles.defenseLabel, textStyle]}>
							Immune To (x0):
						</Text>
						<View style={styles.typeBadgeContainer}>
							{defenses.immune.map((type) => (
								<TypeBadge key={type} typeName={type} />
							))}
						</View>
					</View>
				)}
				{defenses.weak.length === 0 &&
					defenses.resistant.length === 0 &&
					defenses.immune.length === 0 && (
						<Text style={textStyle}>
							Normal effectiveness against all types.
						</Text>
					)}
			</View>
		</ScrollView>
	);
};
