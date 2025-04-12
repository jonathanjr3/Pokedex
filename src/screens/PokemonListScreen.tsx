import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    Button,
    SafeAreaView,
    useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import type { Pokemon } from 'pokenode-ts';
import apiClient from '../api/PokeClient';
import { useTheme } from '../styles/useTheme';
import PokemonListItem from '../components/PokemonListItem';

// Configuration for Grid Layout
const POKEMON_LIMIT = 30;
const LIST_HORIZONTAL_PADDING = 10;
const DESIRED_ITEM_WIDTH = 160; // Target width for each card

const PokemonListScreen: React.FC = () => {
    // State
    const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingMore, setLoadingMore] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [offset, setOffset] = useState<number>(0);
    const [canLoadMore, setCanLoadMore] = useState<boolean>(true);

    // Hooks
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const { width, height } = useWindowDimensions();

    // Dynamic Column Calculation
    const calculateNumColumns = useCallback(() => {
        const availableWidth = width - (LIST_HORIZONTAL_PADDING * 2) - (insets.left + insets.right);
        const effectiveItemWidth = DESIRED_ITEM_WIDTH + 10;
        const calculatedCols = Math.floor(availableWidth / effectiveItemWidth);
        return Math.max(1, calculatedCols); // Ensure at least 1 column
    }, [width, insets.left, insets.right]);

    const numColumns = calculateNumColumns();

    // Styles
    const backgroundStyle = {
        backgroundColor: theme.background,
        flex: 1,
    };

    const containerStyle = {
        flex: 1,
        paddingTop: 10,
        paddingBottom: insets.bottom,
        paddingHorizontal: LIST_HORIZONTAL_PADDING + Math.max(insets.left, insets.right),
    };

    const textColor = {
        color: theme.text,
    };

    // Helper function to update pokemon list state, preventing duplicates
    const appendPokemonData = (detailedPokemon: Pokemon[]) => {
        setPokemonList((prevList) => {
            const existingIds = new Set(prevList.map(p => p.id));
            const newItems = detailedPokemon.filter(newItem => !existingIds.has(newItem.id));
            return newItems.length > 0 ? [...prevList, ...newItems] : prevList;
        });
    };

    // Data Fetching - Modified to fetch details concurrently
    const fetchPokemon = useCallback(async (currentOffset: number, isInitialLoad: boolean = false, isRetry: boolean = false) => {
        if ((!isRetry && (loading || loadingMore)) || (!isInitialLoad && !canLoadMore)) { return; }
        if (isInitialLoad) setLoading(true); else setLoadingMore(true);
        setError(null);
        console.log(`Fetching Pokemon list: offset=${currentOffset}, limit=${POKEMON_LIMIT}`);
        try {
            // 1. Fetch the list of names/URLs
            const listData = await apiClient.listPokemons(currentOffset, POKEMON_LIMIT);

            if (listData.results && listData.results.length > 0) {
                console.log(`Fetched ${listData.results.length} names. Fetching details...`);
                // 2. Fetch details for all items in the batch concurrently
                const detailPromises = listData.results.map(item => apiClient.getPokemonByName(item.name));
                const detailedPokemon = await Promise.all(detailPromises);
                console.log(`Fetched details for ${detailedPokemon.length} Pokemon.`);

                // 3. Append new details using the helper
                appendPokemonData(detailedPokemon);

                // 4. Update offset and load more status based on the list fetch
                const newOffset = currentOffset + listData.results.length;
                setOffset(newOffset);
                setCanLoadMore(!!listData.next && newOffset < (listData.count ?? Infinity));
                console.log(`New offset: ${newOffset}, Can load more: ${!!listData.next && newOffset < (listData.count ?? Infinity)}`);

            } else {
                // No more items in the list
                setCanLoadMore(false);
                console.log("No more Pokemon to load.");
            }
        } catch (err) {
            console.error("Failed during Pokemon fetching process:", err);
            setError('Failed to fetch Pokemon data. Please try again.');
            // Keep existing items on screen if it's a 'load more' error
            if (isInitialLoad) setPokemonList([]);
        } finally {
            if (isInitialLoad) setLoading(false); else setLoadingMore(false);
        }
    }, [loading, loadingMore, canLoadMore]);

    // Initial fetch
    useEffect(() => {
        // Fetch initial data only if the list is empty
        if (pokemonList.length === 0 && !loading && !error) { 
            fetchPokemon(0, true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run only once on mount if list is empty

    // Event Handlers
    const handleLoadMore = () => {
        console.log("handleLoadMore called. canLoadMore:", canLoadMore, "loadingMore:", loadingMore);
        if (canLoadMore && !loadingMore && !loading) {
            fetchPokemon(offset);
        }
    };

    const handleRetryLoadMore = () => {
        console.log("Retrying load more from offset:", offset);
        setError(null); // Clear error before retry
        fetchPokemon(offset, false, true); // Pass true for isRetry
    };

    const handleRetryInitialLoad = () => {
        console.log("Retrying initial load");
        setOffset(0); // Reset offset for initial load retry
        setPokemonList([]); // Clear potentially stale list
        fetchPokemon(0, true, true); // Pass true for isInitialLoad and isRetry
    };

    // Render Functions
    const renderItem = ({ item }: { item: Pokemon }) => (
        <PokemonListItem pokemon={item} />
    );

    const renderFooter = () => {
        if (error && !loadingMore && pokemonList.length > 0) {
            return (
                <View style={styles.footerContainer}>
                    <Text style={[styles.inlineErrorText, { color: theme.notification }]}>
                        {error}
                    </Text>
                    <Button title="Retry Load More" onPress={handleRetryLoadMore} color={theme.primary} />
                </View>
            );
        }
        if (loadingMore) {
            return (
                <View style={styles.footerContainer}>
                    <ActivityIndicator size="small" color={theme.primary} />
                </View>
            );
        }
        if (!canLoadMore && pokemonList.length > 0 && !loadingMore && !error) {
            return (
                <View style={styles.footerContainer}>
                    <Text style={textColor}>No more Pokémon to load.</Text>
                </View>
            );
        }
        return null;
    };

    // Loading / Error States
    if (loading && pokemonList.length === 0) {
        return (
            <SafeAreaView style={backgroundStyle}>
                <View style={[styles.centerContainer, containerStyle]}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            </SafeAreaView>
        );
    }

    if (error && pokemonList.length === 0 && !loading) {
        return (
            <SafeAreaView style={backgroundStyle}>
                <View style={[styles.centerContainer, containerStyle]}>
                    <Text style={[styles.errorText, { color: theme.notification }]}>{error}</Text>
                    <Button title="Retry Initial Load" onPress={handleRetryInitialLoad} color={theme.primary} />
                </View>
            </SafeAreaView>
        );
    }

    // Main Render
    return (
        <SafeAreaView style={backgroundStyle}>
            <View style={containerStyle}>
                <FlashList
                    numColumns={numColumns}
                    data={pokemonList}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    estimatedItemSize={220}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.8}
                    ListFooterComponent={renderFooter}
                    ListEmptyComponent={
                        !loading && !error && pokemonList.length === 0 ? (
                            <View style={styles.centerContainerFlex}>
                                <Text style={textColor}>No Pokemon found.</Text>
                            </View>
                        ) : null
                    }
                    removeClippedSubviews={true}
                    drawDistance={height * 2}
                    maintainVisibleContentPosition={{
                        minIndexForVisible: 0,
                    }}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    centerContainerFlex: { // Empty List component
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        minHeight: 300,
    },
    centerContainer: { // Initial Loading/Error states
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 15,
    },
    footerContainer: {
        paddingVertical: 20,
        alignItems: 'center',
        width: '100%',
    },
    inlineErrorText: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 10,
    },
});

export default PokemonListScreen;