import type { Pokemon, PokemonSpecies } from "pokenode-ts";
import { useTheme } from "../hooks/useTheme";
import { ScrollView, StyleSheet, Text, useColorScheme, View } from "react-native";
import type React from "react";
import { useMemo } from "react";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { formatName } from "../utils/StringHelpers";

// Styles
const styles = StyleSheet.create({
  sceneContainer: {
    padding: 15,
    flexGrow: 1,
  },
  sceneContainerLandscape: {
    paddingTop: 15,
    paddingHorizontal: 5,
    flexGrow: 1
  },
  card: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  shadow: { // Shadow for light mode
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
    fontWeight: 'bold',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 0,
  },
  rowItemFirst: {
    marginRight: 7.5,
  },
  rowItemLast: {
    marginLeft: 7.5,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    flex: 1,
  },
  icon: {
    marginRight: 10,
  },
  infoLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  flavorText: {
    fontSize: 14,
    lineHeight: 20,
  },
  genderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  abilityRow: {
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  abilityText: {
    fontSize: 14,
  },
  hiddenAbilityText: {
    fontSize: 12,
    marginLeft: 8,
    fontStyle: 'italic',
    opacity: 0.7,
  },
});

export const AboutScene: React.FC<{ pokemon: Pokemon; species: PokemonSpecies; isLandscape: boolean }> = ({ pokemon, species, isLandscape }) => {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const textStyle = { color: theme.text };
  const textMutedStyle = { color: theme.textMuted };
  const cardStyle = [styles.card, { backgroundColor: theme.card }];
  const shadowStyle = isDarkMode ? {} : styles.shadow;

  const flavorTextEntry = useMemo(() => {
    const englishEntries = species.flavor_text_entries.filter(entry => entry.language.name === 'en');
    if (!englishEntries || englishEntries.length === 0) return 'No description available.';
    return englishEntries[englishEntries.length - 1].flavor_text.replace(/[\n\f]/g, ' ');
  }, [species.flavor_text_entries]);

  const genderRate = species.gender_rate;
  const genderDisplay = useMemo(() => {
    if (genderRate === -1) return <Text style={{color: theme.text}}>Genderless</Text>;
    const femaleChance = (genderRate / 8) * 100;
    const maleChance = 100 - femaleChance;
    return (
      <View style={styles.genderRow}>
        <MaterialCommunityIcons name="gender-male" size={18} color="#6890F0" />
        <Text style={[{ color: theme.text, marginLeft: 5, marginRight: 15 }]}>{maleChance.toFixed(1)}%</Text>
        <MaterialCommunityIcons name="gender-female" size={18} color="#EE99AC" />
        <Text style={[{ color: theme.text, marginLeft: 5 }]}>{femaleChance.toFixed(1)}%</Text>
      </View>
    );
  }, [genderRate, theme]);


  return (
    <ScrollView
      contentContainerStyle={isLandscape ? styles.sceneContainerLandscape : styles.sceneContainer}
      showsVerticalScrollIndicator={false}>
      {/* Description */}
      <View style={[cardStyle, shadowStyle]}>
        <Text style={[styles.sectionTitle, textStyle]}>Pokédex Entry</Text>
        <Text style={[styles.flavorText, textStyle]}>{flavorTextEntry}</Text>
      </View>

      {/* Height & Weight */}
      <View style={[styles.row]}>
        <View style={[cardStyle, shadowStyle, styles.infoCard, styles.rowItemFirst]}>
          <MaterialCommunityIcons name="ruler" size={20} color={theme.textMuted} style={styles.icon} />
          <View>
            <Text style={[styles.infoLabel, textMutedStyle]}>Height</Text>
            <Text style={[styles.infoValue, textStyle]}>{pokemon.height / 10} m</Text>
          </View>
        </View>
        <View style={[cardStyle, shadowStyle, styles.infoCard, styles.rowItemLast]}>
          <MaterialCommunityIcons name="weight-kilogram" size={20} color={theme.textMuted} style={styles.icon} />
          <View>
            <Text style={[styles.infoLabel, textMutedStyle]}>Weight</Text>
            <Text style={[styles.infoValue, textStyle]}>{pokemon.weight / 10} kg</Text>
          </View>
        </View>
      </View>

      {/* Gender */}
      <View style={[cardStyle, shadowStyle]}>
        <Text style={[styles.sectionTitle, textStyle]}>Gender</Text>
        {genderDisplay}
      </View>

      {/* Abilities Section */}
      <View style={[cardStyle, shadowStyle]}>
        <Text style={[styles.sectionTitle, textStyle]}>Abilities</Text>
        {pokemon.abilities.map((abilityInfo) => (
          <View key={abilityInfo.slot} style={styles.abilityRow}>
            <Text style={[styles.abilityText, textStyle]}>
              {formatName(abilityInfo.ability.name)}
            </Text>
            {abilityInfo.is_hidden && (
              <Text style={[styles.hiddenAbilityText, textMutedStyle]}>
                (Hidden)
              </Text>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};