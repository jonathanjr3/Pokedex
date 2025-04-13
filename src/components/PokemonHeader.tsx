import type React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import type { Pokemon } from 'pokenode-ts';
import { useTheme } from '../hooks/useTheme';
import { formatName } from '../utils/StringHelpers';
import { getPokemonTypeColor } from '../utils/PokemonTypeColors';
import LinearGradient from 'react-native-linear-gradient';
import { BlurView } from '@react-native-community/blur';

interface Props {
  pokemon: Pokemon;
  isLandscape: boolean;
  speciesHexColor: string | null;
}

const PokemonHeader: React.FC<Props> = ({ pokemon, isLandscape, speciesHexColor }) => {
  const theme = useTheme();

  const mainSprite = pokemon.sprites?.other?.['official-artwork']?.front_default
    ?? pokemon.sprites?.front_default;

  const headerStyle = {
    borderBottomColor: theme.border,
    borderRightColor: theme.border
  };
  const textStyle = { color: theme.text };
  const textMutedStyle = { color: theme.text, opacity: 0.7 };
  const typeTextStyle = { color: theme.card };

  // Calculate type details (name and color) once
  const typeDetails = pokemon.types.map(typeInfo => ({
      name: typeInfo.type.name,
      color: getPokemonTypeColor(typeInfo.type.name),
  }));

  // --- New Gradient Logic ---
  // Get just the hex colors for the gradient
  const typeHexColors = typeDetails
      .map(detail => detail.color)
      .filter((color): color is string => !!color); // Filter out null/undefined

  // Start gradient with species color (or primary fallback)
  const baseGradientColor = speciesHexColor ?? theme.primary;

  // Combine species color with type colors
  let calculatedGradientColors = [baseGradientColor, ...typeHexColors];

  // Ensure at least two colors for the gradient
  if (calculatedGradientColors.length < 2) {
      // If only one base color, add highlight as the second color
      calculatedGradientColors.push(theme.skeletonHighlight);
  }

  // Remove duplicates just in case
  calculatedGradientColors = [...new Set(calculatedGradientColors)];
  if (calculatedGradientColors.length < 2) {
      // Final fallback if duplicates made it too short
      calculatedGradientColors = [theme.primary, theme.skeletonHighlight];
  }
  // --- End New Gradient Logic ---

  const blurType = theme.background === '#000000' ? 'dark' : 'light';

  return (
    <View style={[
      styles.headerContainer,
      isLandscape && styles.headerContainerLandscape,
      headerStyle
    ]}>
      <LinearGradient
        colors={calculatedGradientColors}
        style={StyleSheet.absoluteFillObject}
      />
      <BlurView
        style={StyleSheet.absoluteFillObject}
        blurType={blurType}
        blurAmount={10}
      />
      <View style={styles.contentContainer}>
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
          {typeDetails.map((typeDetail) => {
            // Fallback color in case getPokemonTypeColor returned null
            const typeColor = typeDetail.color ?? theme.skeletonHighlight;
            return (
              // Use type name as key since slot might not be unique if typeDetails changes order later
              <View key={typeDetail.name} style={[styles.typeBadge, {backgroundColor: typeColor}]}>
                <Text style={[styles.typeText, typeTextStyle]}>
                  {formatName(typeDetail.name)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

// Styles relevant to the header section
const styles = StyleSheet.create({
  headerContainer: {
    alignItems: 'center',
    paddingTop: 10,
  },
  headerContainerLandscape: {
    justifyContent: 'center',
    borderRadius: 12,
    marginVertical: 15,
    height: "100%",
    overflow: 'hidden',
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
  contentContainer: {
    alignItems: 'center',
    zIndex: 1,
  },
});

export default PokemonHeader;