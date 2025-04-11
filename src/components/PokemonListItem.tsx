import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import type { NamedAPIResource, Pokemon, PokemonType } from 'pokenode-ts';
import apiClient from '../api/PokeClient';
import { useTheme } from '../styles/useTheme';
import { useNavigation } from '@react-navigation/native';
import type { PokemonListNavigationProp } from '../navigation/types';
import { getPokemonTypeColor } from '../utils/PokemonTypeColors';
import { formatName } from '../utils/StringHelpers';

interface Props {
  item: NamedAPIResource;
}

const PokemonListItem: React.FC<Props> = ({ item }) => {
  const [pokemonDetails, setPokemonDetails] = useState<Pokemon | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  const theme = useTheme();
  const navigation = useNavigation<PokemonListNavigationProp>();

  useEffect(() => {
    const fetchDetails = async () => {
      // Reset state for potentially recycled component instances in FlashList
      setLoading(true);
      setError(false);
      setPokemonDetails(null); // Clear previous details
      try {
        const details = await apiClient.getPokemonByName(item.name);
        setPokemonDetails(details);
      } catch (err) {
        console.error(`Failed to fetch details for ${item.name}:`, err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [item.name]); // Depend only on item.name

  const handlePress = useCallback(() => {
    if (pokemonDetails) {
      navigation.navigate('PokemonDetail', { pokemon: pokemonDetails });
    }
  }, [navigation, pokemonDetails]);

  // Use official artwork if available, fallback to front_default
  const spriteUri = pokemonDetails?.sprites?.other?.['official-artwork']?.front_default
    ?? pokemonDetails?.sprites?.front_default;

  const cardStyle = {
    backgroundColor: theme.card,
  };
  const textStyle = { color: theme.text };
  const mutedTextStyle = { color: theme.text, opacity: 0.6 }; // For ID

  // Component to render the sprite area (handling loading/error)
  const renderSpriteArea = () => {
    if (loading) {
      return <ActivityIndicator style={styles.sprite} size="small" color={theme.primary} />;
    }
    if (error || !spriteUri) {
      // Simple placeholder for error or missing sprite
      return <View style={[styles.sprite, styles.spritePlaceholder]}><Text>!</Text></View>;
    }
    return (
      <Image
        style={styles.sprite}
        source={{ uri: spriteUri }}
        resizeMode="contain"
      />
    );
  };

  return (
    <TouchableOpacity
      style={[styles.container, cardStyle]}
      onPress={handlePress}
      disabled={loading || error || !pokemonDetails} // Prevent navigation until ready
      activeOpacity={0.7} // Standard touch feedback
    >
      {/* ID Text */}
      {pokemonDetails && ( // Only show ID when details are loaded
        <Text style={[styles.idText, mutedTextStyle]}>
          #{pokemonDetails.id.toString().padStart(4, '0')} {/* Pad to 4 digits */}
        </Text>
      )}

      {/* Sprite Area */}
      <View style={styles.spriteContainer}>
        {renderSpriteArea()}
      </View>

      {/* Name Text */}
      <Text style={[styles.nameText, textStyle]} numberOfLines={1} ellipsizeMode="tail">
        {formatName(item.name)}
      </Text>

      {/* Types Container */}
      {pokemonDetails && ( // Only show types when details are loaded
        <View style={styles.typesContainer}>
          {pokemonDetails.types.map((typeInfo: PokemonType) => {
            const typeName = typeInfo.type.name;
            const typeColor = getPokemonTypeColor(typeName);
            // const textColor = parseInt(typeColor.substring(1), 16) > 0x888888 ? theme.text : theme.card;
            const textColor = theme.card;

            return (
              <View key={typeName} style={[styles.typeBadge, { backgroundColor: typeColor }]}>
                <Text style={[styles.typeText, { color: textColor }]}>
                  {formatName(typeName)}
                </Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Show loading/error indicator subtly if details aren't ready */}
      {(error && !pokemonDetails) && (
        <View style={styles.loadingOverlay}>
          <Text>!</Text>
        </View>
      )}

    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    padding: 10,
    margin: 5,
    borderRadius: 12,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  idText: {
    position: 'absolute',
    top: 6,
    right: 8,
    fontSize: 11,
    fontWeight: '600',
  },
  spriteContainer: {
    width: '80%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 15,
  },
  sprite: {
    width: '100%',
    height: '100%',
  },
  spritePlaceholder: {
    backgroundColor: 'rgba(128,128,128,0.1)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameText: {
    fontSize: 15,
    fontWeight: 'bold',
    textTransform: 'capitalize',
    textAlign: 'center',
    marginBottom: 8,
  },
  typesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    minHeight: 22, // Reserve space even if no types yet, prevents jump
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginHorizontal: 2,
    marginVertical: 2,
  },
  typeText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  errorText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#888',
  },
  loadingOverlay: { // Covers the card content while loading/error before details arrive
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    borderRadius: 12,
  }
});

export default PokemonListItem;