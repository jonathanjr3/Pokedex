import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    Button,
    SafeAreaView,
    useWindowDimensions,
    TextInput,
    TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import type { Pokemon, NamedAPIResource } from 'pokenode-ts';
import apiClient from '../api/PokeClient';
import { useTheme } from '../styles/useTheme';
import PokemonListItem from '../components/PokemonListItem';
import { useDebounce } from '../hooks/useDebounce';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Configuration
const TOTAL_POKEMON_COUNT = 1302; // Approximate total count
const DETAILS_PAGE_LIMIT = 30; // Limit for fetching details per page
const LIST_HORIZONTAL_PADDING = 10;
const DESIRED_ITEM_WIDTH = 160;
const SEARCH_DEBOUNCE_DELAY = 300; // milliseconds

// Helper to extract ID from URL
const extractIdFromUrl = (url: string): number | null => {
    try {
        const parts = url.split('/').filter(Boolean);
        const id = parts.pop();
        return id ? parseInt(id, 10) : null;
    } catch (e) {
        return null;
    }
};

const PokemonListScreen: React.FC = () => {
    // State
    const [displayedPokemon, setDisplayedPokemon] = useState<Pokemon[]>([]); // List with full details for UI
    const [loadingInitialList, setLoadingInitialList] = useState<boolean>(true); // Loading full name list
    const [loadingPageDetails, setLoadingPageDetails] = useState<boolean>(false); // Loading details for a page
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(0); // Current page index for detail fetching
    const [canLoadMoreDetails, setCanLoadMoreDetails] = useState<boolean>(false); // Can we load details for the next page?
    const [searchQuery, setSearchQuery] = useState<string>('');

    // Refs
    const allPokemonNamesRef = useRef<NamedAPIResource[]>([]); // Store the full list of names/URLs
    const initialLoadComplete = useRef<boolean>(false); // Track if initial names + page 0 details are loaded

    // Hooks
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const { width, height } = useWindowDimensions();
    const debouncedSearchQuery = useDebounce(searchQuery, SEARCH_DEBOUNCE_DELAY);

    // Define styles inside the component to access theme
    const styles = StyleSheet.create({
        background: {
            backgroundColor: theme.background,
            flex: 1,
        },
        container: {
            flex: 1,
            paddingTop: 10,
            paddingBottom: insets.bottom,
            paddingHorizontal: LIST_HORIZONTAL_PADDING + Math.max(insets.left, insets.right),
        },
        centerContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        centerContainerFlex: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
            minHeight: 300,
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
        errorText: {
            fontSize: 16,
            textAlign: 'center',
            marginBottom: 15,
        },
        searchInputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            height: 40,
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: 8,
            paddingHorizontal: 10,
            marginBottom: 10,
            backgroundColor: theme.card,
        },
        searchIcon: {
            marginRight: 8,
        },
        searchInput: {
            flex: 1,
            height: '100%',
            fontSize: 16,
            color: theme.text,
            borderWidth: 0,
            backgroundColor: 'transparent',
            paddingVertical: 0,
        },
        clearIcon: {
            marginLeft: 8,
            padding: 2,
        },
    });
    // Assign to constants for easier use in JSX
    const backgroundStyle = styles.background;
    const containerStyle = styles.container;
    const textColor = { color: theme.text }; // Can keep this simple helper if only used for text

    // --- Search and Filtering Logic --- 
    const filteredPokemonNames = useMemo(() => {
        const allNames = allPokemonNamesRef.current;
        const query = debouncedSearchQuery.trim().toLowerCase();

        if (!query) {
            return allNames; // Return all if query is empty
        }

        const queryAsNumber = parseInt(query, 10);
        const isNumericQuery = !isNaN(queryAsNumber);
        let exactMatch: NamedAPIResource | null = null;

        const filtered = allNames.filter(pokemon => {
            const nameMatch = pokemon.name.toLowerCase().includes(query);
            const id = extractIdFromUrl(pokemon.url);
            const idString = id?.toString();
            let idMatch = false;

            if (idString) {
                // Check for exact numeric match
                if (isNumericQuery && id === queryAsNumber) {
                    exactMatch = pokemon;
                    idMatch = true;
                } else if (idString.includes(query)) {
                    // Check for partial numeric match (if not exact)
                    idMatch = true;
                }
            }
            return nameMatch || idMatch;
        });

        // Sort results: exact numeric match first, then by ID ascending
        return filtered.sort((a, b) => {
            if (exactMatch) {
                if (a === exactMatch) return -1; // Exact match comes first
                if (b === exactMatch) return 1;
            }
            const idA = extractIdFromUrl(a.url) ?? Infinity;
            const idB = extractIdFromUrl(b.url) ?? Infinity;
            return idA - idB;
        });

    }, [debouncedSearchQuery]); // Re-filter when debounced query changes

    // --- Data Fetching Logic --- 

    // Fetch details for a specific page based on the *provided* name list (filtered or full)
    const fetchPokemonDetailsForPage = useCallback(async (page: number, namesList: NamedAPIResource[], isRetry: boolean = false) => {
        // Check loading state directly, don't rely on it being a dependency
        // if (!isRetry && loadingPageDetails) return; 

        const startIndex = page * DETAILS_PAGE_LIMIT;
        const endIndex = startIndex + DETAILS_PAGE_LIMIT;
        const namesToFetch = namesList.slice(startIndex, endIndex);

        if (namesToFetch.length === 0) {
            setCanLoadMoreDetails(false);
            if (loadingPageDetails) setLoadingPageDetails(false);
            if (page === 0 && loadingInitialList) setLoadingInitialList(false);
            return;
        }

        // Prevent concurrent fetches manually
        if (loadingPageDetails && !isRetry) {
            console.log("Already loading page details, skipping fetch.");
            return;
        }

        console.log(`Fetching details for page ${page} (indices ${startIndex}-${endIndex - 1}). Count: ${namesToFetch.length}`);
        setLoadingPageDetails(true);
        // We should clear the specific 'load more' error when attempting a new page fetch
        // but maybe not the initial load error if page === 0?
        // Let's clear it for now for simplicity.
        setError(null);

        let pageFetchSuccess = false; // Track success for state updates

        try {
            const detailPromises = namesToFetch.map(item => apiClient.getPokemonByName(item.name));
            const detailedPokemon = await Promise.all(detailPromises);

            setDisplayedPokemon((prevList) => {
                if (page === 0) {
                    return detailedPokemon; // Replace for page 0
                }
                const existingIds = new Set(prevList.map(p => p.id));
                const newItems = detailedPokemon.filter(newItem => !existingIds.has(newItem.id));
                return [...prevList, ...newItems]; // Append for subsequent pages
            });

            setCurrentPage(page + 1);
            setCanLoadMoreDetails(endIndex < namesList.length);
            pageFetchSuccess = true;

        } catch (err) {
            console.error(`Failed to fetch details for page ${page}:`, err);
            setError('Failed to load more Pokemon details. Please try again.');
            pageFetchSuccess = false; // Ensure canLoadMore isn't incorrectly true
            setCanLoadMoreDetails(false);
        } finally {
            setLoadingPageDetails(false);
            if (page === 0) {
                console.log(`Finished processing page 0. Setting initialLoadComplete to true.`);
                setLoadingInitialList(false);
                initialLoadComplete.current = true; // Mark initial load as complete
                if (!pageFetchSuccess) {
                    setCanLoadMoreDetails(false);
                }
            }
        }
        // Remove dependencies - relies on arguments and checks state inside
    }, []);

    // --- Recalculate pagination based on filtered list OR when search is cleared --- 
    useEffect(() => {
        // Only run AFTER initial load (names + page 0) is fully complete
        if (!initialLoadComplete.current) {
            // console.log("Search effect skipped: Initial load not complete.");
            return;
        }

        // This effect now runs *only* when the debounced query changes after initial load.
        console.log(`Search effect running for query: '${debouncedSearchQuery}'`);

        const targetNameList = debouncedSearchQuery ? filteredPokemonNames : allPokemonNamesRef.current;

        // Reset state for the new search/clear
        setCurrentPage(0);
        setDisplayedPokemon([]);
        const newCanLoadMore = targetNameList.length > DETAILS_PAGE_LIMIT;
        setCanLoadMoreDetails(newCanLoadMore);

        if (targetNameList.length > 0) {
            console.log(`Fetching page 0 for target list (size: ${targetNameList.length})`);
            fetchPokemonDetailsForPage(0, targetNameList);
        } else {
            console.log("Target list empty, not fetching page 0.");
            setCanLoadMoreDetails(false);
        }

        // Depend only on the debounced query value and the stable fetcher function.
        // This prevents the effect from running just because the initial names ref was populated.
    }, [debouncedSearchQuery, fetchPokemonDetailsForPage]);

    // Fetch the FULL list of names initially
    const fetchFullPokemonList = useCallback(async () => {
        console.log('Starting to fetch all Pokemon names...');
        initialLoadComplete.current = false; // Reset flag on new fetch
        setLoadingInitialList(true);
        setError(null);
        setDisplayedPokemon([]);
        setCurrentPage(0);
        // Ensure search is also cleared on initial load/retry
        // setSearchQuery(''); // Optional: Clear search on initial load?
        allPokemonNamesRef.current = [];

        try {
            console.log(`Attempting to fetch ${TOTAL_POKEMON_COUNT} names at once...`);
            const data = await apiClient.listPokemons(0, TOTAL_POKEMON_COUNT);
            console.log(`Fetched ${data.results.length} names.`);

            if (data.results && data.results.length > 0) {
                allPokemonNamesRef.current = data.results;
                setCanLoadMoreDetails(true);
                // Restore the direct call to fetch page 0 after names are loaded
                console.log("Name fetch complete. Fetching details for page 0...");
                await fetchPokemonDetailsForPage(0, allPokemonNamesRef.current);
            } else {
                setCanLoadMoreDetails(false);
                setLoadingInitialList(false);
            }
        } catch (err) {
            console.error("Failed to fetch all Pokemon names:", err);
            setError('Failed to load the initial Pokemon list. Please try again.');
            allPokemonNamesRef.current = [];
            setDisplayedPokemon([]);
            setLoadingInitialList(false);
        }
    }, [fetchPokemonDetailsForPage]);

    // --- Effects --- 

    // Initial fetch trigger
    useEffect(() => {
        // This runs only once on mount to kick things off
        fetchFullPokemonList();
    }, [fetchFullPokemonList]); // Depends on the memoized fetchFullPokemonList

    // Dynamic Column Calculation
    const calculateNumColumns = useCallback(() => {
        const availableWidth = width - (LIST_HORIZONTAL_PADDING * 2) - (insets.left + insets.right);
        const effectiveItemWidth = DESIRED_ITEM_WIDTH + 10;
        const calculatedCols = Math.floor(availableWidth / effectiveItemWidth);
        return Math.max(1, calculatedCols); // Ensure at least 1 column
    }, [width, insets.left, insets.right]);

    const numColumns = calculateNumColumns();

    // --- Event Handlers --- 
    // Wrap handleLoadMore in useCallback
    const handleLoadMore = useCallback(() => {
        // Add log to see what currentPage it's using
        console.log(`handleLoadMore triggered. Current Page: ${currentPage}, Can Load More: ${canLoadMoreDetails}, Loading Details: ${loadingPageDetails}, Loading Initial: ${loadingInitialList}`);

        if (canLoadMoreDetails && !loadingPageDetails) {
            console.log("handleLoadMore: Fetching next page details for filtered list.");
            const listToPaginate = debouncedSearchQuery
                ? filteredPokemonNames // Use filtered list if search is active
                : allPokemonNamesRef.current; // Use full list otherwise
            if (listToPaginate.length > currentPage * DETAILS_PAGE_LIMIT) {
                fetchPokemonDetailsForPage(currentPage, listToPaginate);
            } else {
                console.log("handleLoadMore: Calculated that no more items exist for the current list.");
                setCanLoadMoreDetails(false); // Correctly set based on calculation
            }
        }
        // dependencies, include things that determine *which* list to use or *if* loading can happen
    }, [
        canLoadMoreDetails,
        loadingPageDetails,
        currentPage,
        debouncedSearchQuery, // Determines which list to use
        filteredPokemonNames, // Needed if query is active
        fetchPokemonDetailsForPage
    ]);

    const handleRetryLoadMore = () => {
        if (!loadingPageDetails) {
            const listToRetry = debouncedSearchQuery
                ? filteredPokemonNames
                : allPokemonNamesRef.current;
            console.log("Retrying load more details for page:", currentPage, "using list size:", listToRetry.length);
            // Reset error before retry
            setError(null);
            // Reset canLoadMore based on the list we are retrying
            setCanLoadMoreDetails(listToRetry.length > currentPage * DETAILS_PAGE_LIMIT);
            fetchPokemonDetailsForPage(currentPage, listToRetry, true);
        }
    };

    const handleRetryInitialLoad = () => {
        console.log("Retrying initial full list load");
        fetchFullPokemonList();
    };

    const handleClearSearch = () => {
        setSearchQuery('');
    };

    // Render Functions
    const renderItem = ({ item }: { item: Pokemon }) => (
        <PokemonListItem pokemon={item} />
    );

    const renderFooter = () => {
        if (error && !loadingPageDetails && displayedPokemon.length > 0) {
            return (
                <View style={styles.footerContainer}>
                    <Text style={[styles.inlineErrorText, { color: theme.notification }]}>
                        {error} {/* Show specific load more error */}
                    </Text>
                    <Button title="Retry Load More" onPress={handleRetryLoadMore} color={theme.primary} />
                </View>
            );
        }
        if (loadingPageDetails) {
            return (
                <View style={styles.footerContainer}>
                    <ActivityIndicator size="small" color={theme.primary} />
                </View>
            );
        }
        // Base end of list message on the *filtered* list and whether more details can be loaded
        if (!canLoadMoreDetails && filteredPokemonNames.length > 0 && !loadingPageDetails && !error) {
            return (
                <View style={styles.footerContainer}>
                    <Text style={textColor}>No more Pokémon to load.</Text>
                </View>
            );
        }
        return null;
    };

    // Loading / Error States
    if (loadingInitialList) {
        return (
            <SafeAreaView style={backgroundStyle}>
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <Text style={[textColor, { marginTop: 10 }]}>Loading Pokémon list...</Text>
                </View>
            </SafeAreaView>
        );
    }

    // Error during initial fetch OR first page fetch resulting in empty list
    if (error && displayedPokemon.length === 0 && !loadingInitialList) {
        return (
            <SafeAreaView style={backgroundStyle}>
                <View style={styles.centerContainer}>
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
                {/* Updated Search Input Area */}
                <View style={styles.searchInputContainer}>
                    <Icon
                        name="search"
                        size={20}
                        color={theme.text + '80'}
                        style={styles.searchIcon}
                    />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by Name or Pokédex Number"
                        placeholderTextColor={theme.text + '80'}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={handleClearSearch} hitSlop={10}>
                            <Icon
                                name="cancel"
                                size={20}
                                color={theme.text + '80'}
                                style={styles.clearIcon}
                            />
                        </TouchableOpacity>
                    )}
                </View>

                <FlashList
                    numColumns={numColumns}
                    data={displayedPokemon} // Display the detailed pokemon from current pages
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    estimatedItemSize={220}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.8}
                    ListFooterComponent={renderFooter}
                    ListEmptyComponent={
                        // Show if not loading details, no error, and the *filtered* list is empty
                        !loadingInitialList && !loadingPageDetails && !error && filteredPokemonNames.length === 0 ? (
                            <View style={styles.centerContainerFlex}>
                                <Text style={textColor}>No Pokémons matching your search.</Text>
                            </View>
                        ) : null // Otherwise, footer loader or content will show
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

export default PokemonListScreen;