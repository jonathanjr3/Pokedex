import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import type { Pokemon, PokemonType } from 'pokenode-ts';
import { useTheme } from '../styles/useTheme';
import { formatName } from '../utils/StringHelpers';
import { getPokemonTypeColor } from '../utils/PokemonTypeColors';

interface Props {
  pokemon: Pokemon;
  isLandscape: boolean;
}

const PokemonHeader: React.FC<Props> = ({ pokemon, isLandscape }) => {
  const theme = useTheme();

  const mainSprite = pokemon.sprites?.other?.['official-artwork']?.front_default
    ?? pokemon.sprites?.front_default;

  const headerStyle = {
    backgroundColor: theme.card,
    borderBottomColor: theme.border,
    borderRightColor: theme.border
  };
  const textStyle = { color: theme.text };
  const textMutedStyle = { color: theme.text, opacity: 0.7 };
  const typeTextStyle = { color: theme.card };

  return (
    <View style={[
      styles.headerSection,
      isLandscape && styles.headerSectionLandscape,
      headerStyle
    ]}>
      {mainSprite ? (
        <Image style={isLandscape ? styles.mainSpriteLandscape : styles.mainSpritePortrait} source={{ uri: mainSprite }} resizeMode="contain" />
      ) : (
        <View style={[isLandscape ? styles.mainSpriteLandscape : styles.mainSpritePortrait, styles.spritePlaceholder]}>
          <Text style={textStyle}>?</Text>
        </View>
      )}
      <Text style={[styles.name, textStyle]}>
        {formatName(pokemon.name)}
      </Text>
      <Text style={[styles.idText, textMutedStyle]}>
        #{pokemon.id.toString().padStart(3, '0')}
      </Text>
      <View style={styles.typesContainer}>
        {pokemon.types.map((typeInfo: PokemonType) => {
          const typeColor = getPokemonTypeColor(typeInfo.type.name);
          return (
            <View key={typeInfo.slot} style={[styles.typeBadge, {backgroundColor: typeColor}]}>
              <Text style={[styles.typeText, typeTextStyle]}>
                {formatName(typeInfo.type.name)}
              </Text>
            </View>
          );
        })}
      </View>
      <View style={[styles.basicInfoContainer, {paddingBottom: isLandscape ? 15 : 20}]}>
        <View style={styles.infoBox}>
          <Text style={[styles.infoLabel, textMutedStyle]}>Height</Text>
          <Text style={[styles.infoValue, textStyle]}>{pokemon.height / 10} m</Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={[styles.infoLabel, textMutedStyle]}>Weight</Text>
          <Text style={[styles.infoValue, textStyle]}>{pokemon.weight / 10} kg</Text>
        </View>
      </View>
    </View>
  );
};

// Styles relevant to the header section
const styles = StyleSheet.create({
  headerSection: {
    alignItems: 'center',
    paddingTop: 10,
  },
  headerSectionLandscape: {
    justifyContent: 'center',
    borderRadius: 12,
    marginVertical: 15,
    height: "100%",
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E0E0E0',
    borderRadius: 60,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    textTransform: 'capitalize',
    marginBottom: 4,
    textAlign: 'center',
  },
  idText: {
    fontSize: 14,
    marginBottom: 10,
  },
  typesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 15,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 15,
    margin: 3,
  },
  typeText: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  basicInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '90%',
  },
  infoBox: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default PokemonHeader;