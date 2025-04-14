import type {
	Pokemon,
	PokemonSpecies,
	Type as PokemonTypeData,
} from "pokenode-ts";
import type React from "react";
import { useState } from "react";
import { useColorScheme, useWindowDimensions } from "react-native";
import {
	type NavigationState,
	type Route,
	type SceneRendererProps,
	TabBar,
	TabView,
} from "react-native-tab-view";
import { useTheme } from "../hooks/useTheme";
import { AboutScene } from "./PokemonAbout";
import { StatsScene } from "./PokemonStats";

interface Props {
	pokemon: Pokemon;
	species: PokemonSpecies | null;
	typesData: PokemonTypeData[];
	speciesHexColor: string;
	isLandscape: boolean;
}

// Define the specific route type based on keys
interface TabRoute extends Route {
	key: "about" | "stats";
}

const PokemonDetailsBody: React.FC<Props> = ({
	pokemon,
	species,
	typesData,
	speciesHexColor,
	isLandscape,
}) => {
	const layout = useWindowDimensions();
	const theme = useTheme();
	const colorScheme = useColorScheme();
	const isDarkMode = colorScheme === "dark";

	const [index, setIndex] = useState(0);
	const [routes] = useState<TabRoute[]>([
		{ key: "about", title: "About" },
		{ key: "stats", title: "Stats" },
	]);

	const renderScene = ({ route }: SceneRendererProps & { route: TabRoute }) => {
		switch (route.key) {
			case "about":
				return species ? (
					<AboutScene
						pokemon={pokemon}
						species={species}
						isLandscape={isLandscape}
					/>
				) : null;
			case "stats":
				return typesData.length > 0 ? (
					<StatsScene
						pokemon={pokemon}
						typesData={typesData}
						speciesHexColor={speciesHexColor}
						isLandscape={isLandscape}
					/>
				) : null;
			default:
				return null;
		}
	};

	const renderTabBar = (
		props: SceneRendererProps & { navigationState: NavigationState<TabRoute> },
	) => (
		<TabBar<TabRoute>
			{...props}
			indicatorStyle={{ backgroundColor: speciesHexColor }}
			style={{ backgroundColor: isLandscape ? "transparent" : theme.card }}
			activeColor={speciesHexColor}
			inactiveColor={theme.textMuted}
			pressColor={
				isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"
			}
			scrollEnabled={false}
		/>
	);

	if (!species || typesData.length === 0) {
		return null;
	}

	return (
		<TabView
			navigationState={{ index, routes }}
			renderScene={renderScene}
			onIndexChange={setIndex}
			initialLayout={{ width: layout.width }}
			renderTabBar={renderTabBar}
			style={{ flex: 1 }}
		/>
	);
};

export default PokemonDetailsBody;
