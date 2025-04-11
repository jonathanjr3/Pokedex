import React, { useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
  SafeAreaView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useTheme } from '../styles/useTheme';
import { formatName } from '../utils/StringHelpers';
import PokemonHeader from '../components/PokemonHeader';
import PokemonDetailsBody from '../components/PokemonDetailsBody';

type Props = NativeStackScreenProps<RootStackParamList, 'PokemonDetail'>;

const PokemonDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { pokemon } = route.params;
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  useLayoutEffect(() => {
    navigation.setOptions({
      title: formatName(pokemon?.name ?? '')
    });
  }, [navigation, pokemon?.name]);

  const backgroundStyle = {
    backgroundColor: theme.background,
    flex: 1,
  };

  const containerStyle = {
    flex: 1,
    paddingBottom: insets.bottom,
    paddingLeft: insets.left,
    paddingRight: insets.right,
  };

  // Render Loading/Error
  if (!pokemon) {
    return (
      <SafeAreaView style={[styles.centerContainer, backgroundStyle]}>
        <View style={containerStyle}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={{ color: theme.text, marginTop: 10 }}>Loading Pokemon details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Main Render
  return (
    <SafeAreaView style={backgroundStyle}>
      <View style={containerStyle}>
        {isLandscape ? (
          // Landscape layout
          <View style={styles.landscapeContainer}>
            <View style={styles.landscapeLeftColumn}>
              {/* PokemonHeader component */}
              <PokemonHeader pokemon={pokemon} isLandscape={isLandscape} />
            </View>
            <View style={styles.landscapeRightColumn}>
              <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContainer}>
                {/* PokemonDetailsBody comppnent */}
                <PokemonDetailsBody pokemon={pokemon} isLandscape={isLandscape} />
              </ScrollView>
            </View>
          </View>
        ) : (
          // Portrait layout
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            <PokemonHeader pokemon={pokemon} isLandscape={isLandscape} />
            <PokemonDetailsBody pokemon={pokemon} isLandscape={isLandscape} />
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  landscapeContainer: {
    flex: 1,
    flexDirection: 'row'
  },
  landscapeLeftColumn: {
    width: '40%',
    paddingHorizontal: 5
  },
  landscapeRightColumn: {
    flex: 1,
  }
});

export default PokemonDetailScreen;