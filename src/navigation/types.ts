import type { NativeStackScreenProps } from '@react-navigation/native-stack';

// Define the parameters expected by each screen
export type RootStackParamList = {
  PokemonList: undefined;
  PokemonDetail: { pokemonName: string };
};

export type PokemonListScreenProps = NativeStackScreenProps<RootStackParamList, 'PokemonList'>;
export type PokemonDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'PokemonDetail'>;