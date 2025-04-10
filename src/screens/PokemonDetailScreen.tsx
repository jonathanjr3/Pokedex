import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import type { PokemonDetailScreenProps } from '../navigation/types';
import { useTheme } from '../styles/useTheme';

const PokemonDetailScreen: React.FC<PokemonDetailScreenProps> = ({ route }) => {
  const theme = useTheme();
  const { pokemonName } = route.params;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      color: theme.text,
      fontSize: 18,
      textTransform: 'capitalize',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <Text style={styles.text}>Detail Screen for: {pokemonName}</Text>
      </View>
    </SafeAreaView>
  );
};

export default PokemonDetailScreen;