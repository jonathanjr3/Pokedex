import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../hooks/useTheme";

const styles = StyleSheet.create({
	statRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 10,
	},
	statLabel: { width: 65, fontSize: 12, textTransform: "capitalize" },
	statValue: { width: 35, fontSize: 13, textAlign: "right", fontWeight: "600" },
	statBarContainer: { flex: 1, height: 6, marginLeft: 8, marginRight: 0 },
	statBarBackground: { flex: 1, borderRadius: 3, overflow: "hidden" },
	statBarFill: { height: "100%", borderRadius: 3 },
});

export const StatBar: React.FC<{
	label: string;
	value: number;
	maxValue?: number;
	color: string;
}> = ({ label, value, maxValue = 255, color }) => {
	const percentage = Math.min(100, Math.max(0, (value / maxValue) * 100));
	const theme = useTheme();
	return (
		<View style={styles.statRow}>
			<Text style={[styles.statLabel, { color: theme.textMuted }]}>
				{label}
			</Text>
			<Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
			<View style={styles.statBarContainer}>
				<View
					style={[styles.statBarBackground, { backgroundColor: theme.border }]}
				>
					<View
						style={[
							styles.statBarFill,
							{ width: `${percentage}%`, backgroundColor: color },
						]}
					/>
				</View>
			</View>
		</View>
	);
};
