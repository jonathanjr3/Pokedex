import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Button } from 'react-native';
import type { PokemonListScreenProps } from '../navigation/types';
import { useTheme } from '../styles/useTheme';

const PokemonListScreen: React.FC<PokemonListScreenProps> = ({ navigation }) => {
  const theme = useTheme();

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
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <Text style={styles.text}>Pokemon List Screen (Placeholder)</Text>
        <Button
          title="Go to Bulbasaur Detail"
          onPress={() => navigation.navigate('PokemonDetail', { pokemonName: 'bulbasaur' })}
          color={theme.primary}
        />
      </View>
    </SafeAreaView>
  );
};

export default PokemonListScreen;