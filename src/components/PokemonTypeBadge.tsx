import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../hooks/useTheme";
import { getPokemonTypeColor } from "../utils/PokemonTypeColors";
import { formatName } from "../utils/StringHelpers";

const styles = StyleSheet.create({
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 15,
    marginRight: 5,
    marginBottom: 5,
  },
  typeText: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
})

export const TypeBadge: React.FC<{ typeName: string }> = ({ typeName }) => {
  const theme = useTheme();
  const color = getPokemonTypeColor(typeName);
  return (
    <View style={[styles.typeBadge, { backgroundColor: color ?? theme.skeletonHighlight }]}>
      <Text style={[styles.typeText, { color: theme.card }]}>{formatName(typeName)}</Text>
    </View>
  );
};