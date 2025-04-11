import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Pokemon, PokemonStat, PokemonAbility } from 'pokenode-ts';
import { useTheme } from '../styles/useTheme';
import { formatName } from '../utils/StringHelpers';

const formatStatName = (name: string): string => {
  switch (name) {
    case 'hp': return 'HP';
    case 'attack': return 'Attack';
    case 'defense': return 'Defense';
    case 'special-attack': return 'Sp. Atk';
    case 'special-defense': return 'Sp. Def';
    case 'speed': return 'Speed';
    default: return formatName(name);
  }
};

// StatBar Component
const StatBar: React.FC<{ label: string; value: number; maxValue?: number; color: string }> = ({
  label,
  value,
  maxValue = 255,
  color
}) => {
  const percentage = Math.min(100, Math.max(0, (value / maxValue) * 100));
  const theme = useTheme();
  return (
    <View style={styles.statRow}>
      <Text style={[styles.statLabel, { color: theme.text }]}>{label}</Text>
      <View style={styles.statBarContainer}>
        <View style={[styles.statBarBackground, { backgroundColor: theme.border }]}>
          <View style={[styles.statBarFill, { width: `${percentage}%`, backgroundColor: color }]} />
        </View>
      </View>
      <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
    </View>
  );
};


// Main Component
interface Props {
  pokemon: Pokemon;
  isLandscape: boolean;
}

const PokemonDetailsBody: React.FC<Props> = ({ pokemon, isLandscape }) => {
  const theme = useTheme();
  const textStyle = { color: theme.text };
  const textMutedStyle = { color: theme.text, opacity: 0.7 };

  return (
    <View style={isLandscape ? styles.detailsContentLandscape : styles.detailsContentPortrait}>
      {/* Stats Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, textStyle]}>Base Stats</Text>
        {pokemon.stats.map((statInfo: PokemonStat) => (
          <StatBar
            key={statInfo.stat.name}
            label={formatStatName(statInfo.stat.name)}
            value={statInfo.base_stat}
            color={theme.primary}
          />
        ))}
      </View>
      {/* Abilities Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, textStyle]}>Abilities</Text>
        {pokemon.abilities.map((abilityInfo: PokemonAbility) => (
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
    </View>
  );
};

// Styles relevant to the details body
const styles = StyleSheet.create({
  detailsContentLandscape: {
    paddingLeft: 15,
    paddingVertical: 15,
  },
  detailsContentPortrait: {
    paddingTop: 15
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 0,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15
  },
  // Stats Styles
  statRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  statLabel: { width: 70, fontSize: 13, textTransform: 'capitalize' },
  statBarContainer: { flex: 1, height: 6, marginHorizontal: 8 },
  statBarBackground: { flex: 1, borderRadius: 3, overflow: 'hidden' },
  statBarFill: { height: '100%', borderRadius: 3 },
  statValue: { width: 30, fontSize: 13, textAlign: 'right', fontWeight: '600' },
  // Abilities Styles
  abilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  abilityText: {
    fontSize: 15,
    textAlign: 'center',
  },
  hiddenAbilityText: {
    fontSize: 12,
    marginLeft: 8,
    fontStyle: 'italic',
  }
});

export default PokemonDetailsBody;