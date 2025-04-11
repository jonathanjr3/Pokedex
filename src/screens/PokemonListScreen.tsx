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
import type { NamedAPIResource } from 'pokenode-ts';
import apiClient from '../api/PokeClient';
import { useTheme } from '../styles/useTheme';
import PokemonListItem from '../components/PokemonListItem';

// Configuration for Grid Layout
const POKEMON_LIMIT = 30;
const LIST_HORIZONTAL_PADDING = 10;
const DESIRED_ITEM_WIDTH = 160; // Target width for each card

const PokemonListScreen: React.FC = () => {
    // State
    const [pokemonList, setPokemonList] = useState<NamedAPIResource[]>([]);
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
        // Estimate effective width including margins from PokemonListItem style (margin: 5 -> 10 total)
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

    // Data Fetching
    const fetchPokemon = useCallback(async (currentOffset: number, isInitialLoad: boolean = false, isRetry: boolean = false) => {
        if ((!isRetry && (loading || loadingMore)) || (!isInitialLoad && !canLoadMore)) { return; }
        if (isInitialLoad) setLoading(true); else setLoadingMore(true);
        setError(null);
        console.log(`Fetching Pokemon: offset=${currentOffset}, limit=${POKEMON_LIMIT}`);
        try {
            const data = await apiClient.listPokemons(currentOffset, POKEMON_LIMIT);
            if (data.results.length > 0) {
                setPokemonList((prevList) => {
                    const newItems = data.results.filter(newItem => !prevList.some(existing => existing.name === newItem.name));
                    return [...prevList, ...newItems];
                });
                const newOffset = currentOffset + data.results.length;
                setOffset(newOffset);
                setCanLoadMore(!!data.next && newOffset < (data.count ?? Infinity));
            } else {
                setCanLoadMore(false);
            }
        } catch (err) {
            console.error("Failed to fetch Pokemon list:", err);
            setError('Failed to fetch Pokemon list. Please try again.');
        } finally {
            if (isInitialLoad) setLoading(false); else setLoadingMore(false);
        }
    }, [loading, loadingMore, canLoadMore]);

    // Initial fetch
    useEffect(() => {
        if (pokemonList.length === 0) {
            fetchPokemon(0, true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Fetch only once on mount

    // Event Handlers
    const handleLoadMore = () => {
        console.log("handleLoadMore called. canLoadMore:", canLoadMore, "loadingMore:", loadingMore);
        if (canLoadMore && !loadingMore) {
            fetchPokemon(offset);
        }
    };

    const handleRetryLoadMore = () => {
        console.log("Retrying load more");
        setError(null);
        setLoadingMore(false);
        setTimeout(() => {
            fetchPokemon(offset, false, true);
        }, 0);
    };

     // Render Functions
    const renderItem = ({ item }: { item: NamedAPIResource }) => (
        <PokemonListItem item={item} />
    );

    const renderFooter = () => {
        if (error && !loadingMore && pokemonList.length > 0) {
            return (
                <View style={styles.footerContainer}>
                    <Text style={[styles.inlineErrorText, { color: theme.notification }]}>
                        {error}
                    </Text>
                    <Button title="Retry" onPress={handleRetryLoadMore} color={theme.primary} />
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

    if (error && pokemonList.length === 0) {
        return (
            <SafeAreaView style={backgroundStyle}>
                <View style={[styles.centerContainer, containerStyle]}>
                    <Text style={[styles.errorText, { color: theme.notification }]}>{error}</Text>
                    <Button title="Retry" onPress={() => fetchPokemon(0, true, true)} color={theme.primary} />
                </View>
            </SafeAreaView>
        );
    }

    // Main Render
    return (
        <SafeAreaView style={backgroundStyle}>
            <View style={containerStyle}>
                <FlashList
                    key={numColumns} // Re-render list if numColumns changes
                    numColumns={numColumns}
                    // Data and Rendering
                    data={pokemonList}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.name}
                    // Performance
                    estimatedItemSize={220} // Rough estimate
                    // Load More
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.8} // Load sooner
                    ListFooterComponent={renderFooter}
                    // Empty State
                    ListEmptyComponent={
                        !loading ? ( // Only show if not in initial loading state
                            <View style={styles.centerContainerFlex}>
                                <Text style={textColor}>No Pokemon found.</Text>
                            </View>
                        ) : null
                    }
                    // Optimize rendering slightly
                    removeClippedSubviews={true}
                    drawDistance={height * 2} // Render items further ahead/behind viewport
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
    // Footer styles
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