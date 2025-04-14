import type {
	NativeStackScreenProps,
	NativeStackNavigationProp,
} from "@react-navigation/native-stack";
import type { Pokemon } from "pokenode-ts";

// Define the parameters expected by each screen
export type RootStackParamList = {
	PokemonList: undefined;
	PokemonDetail: { pokemon: Pokemon };
};

export type PokemonListScreenProps = NativeStackScreenProps<
	RootStackParamList,
	"PokemonList"
>;
export type PokemonDetailScreenProps = NativeStackScreenProps<
	RootStackParamList,
	"PokemonDetail"
>;

export type PokemonListNavigationProp = NativeStackNavigationProp<
	RootStackParamList,
	"PokemonList"
>;

export type PokemonDetailNavigationProp = NativeStackNavigationProp<
	RootStackParamList,
	"PokemonDetail"
>;
