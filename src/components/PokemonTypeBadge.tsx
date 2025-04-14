import { StyleSheet, Text, View } from "react-native";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useTheme } from "../hooks/useTheme";
import {
	getPokemonTypeColor,
	getPokemonTypeIcon,
	isColorLight,
} from "../utils/PokemonTypeColors";
import { formatName } from "../utils/StringHelpers";

const getIconComponent = (library: string) => {
	switch (library) {
		case "MaterialCommunityIcons":
			return MaterialCommunityIcons;
		case "MaterialIcons":
			return MaterialIcons;
		case "FontAwesome6":
			return FontAwesome6;
		case "Ionicons":
			return Ionicons;
		default:
			return null;
	}
};

const getTextColourFor = (badgeHexColour: string) => {
	return isColorLight(badgeHexColour) ? "#1C1C1E" : "#FFFFFF";
};

const styles = StyleSheet.create({
	typeBadge: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 15,
		marginRight: 5,
		marginBottom: 5,
	},
	typeIcon: {
		marginRight: 4,
	},
	typeText: {
		fontSize: 11,
		fontWeight: "bold",
		textTransform: "capitalize",
	},
});

export const TypeBadge: React.FC<{ typeName: string }> = ({ typeName }) => {
	const theme = useTheme();
	const color = getPokemonTypeColor(typeName);
	const iconData = getPokemonTypeIcon(typeName);
	const IconComponent = iconData ? getIconComponent(iconData.library) : null;
	const textStyle = { color: getTextColourFor(color) };

	return (
		<View
			style={[
				styles.typeBadge,
				{ backgroundColor: color ?? theme.skeletonHighlight },
			]}
		>
			{IconComponent && iconData && (
				<IconComponent
					name={iconData.name}
					size={12}
					color={textStyle.color}
					style={styles.typeIcon}
				/>
			)}
			<Text style={[styles.typeText, textStyle]}>{formatName(typeName)}</Text>
		</View>
	);
};
