import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProductCard } from '@/components/product-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useFavorites } from '@/contexts/FavoritesContext';
import { apiService } from '@/services/api';
import { Product } from '@/types/product';

const { width } = Dimensions.get('window');

export default function ProductListingScreen() {
    const router = useRouter();
    const { favorites, toggleFavorite, isFavorite } = useFavorites();
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [categories, setCategories] = useState<string[]>([]);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [showCategoryMenu, setShowCategoryMenu] = useState(false);

    useEffect(() => {
        loadProducts();
        loadCategories();
    }, []);

    useEffect(() => {
        filterProducts();
    }, [searchQuery, selectedCategory, products, sortOrder]);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const data = await apiService.getProducts();
            setProducts(data);
            setFilteredProducts(data);
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const data = await apiService.getCategories();
            setCategories(data);
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const filterProducts = () => {
        let filtered = products;

        if (selectedCategory) {
            filtered = filtered.filter(p => p.category === selectedCategory);
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(p =>
                p.title.toLowerCase().includes(query) ||
                p.category.toLowerCase().includes(query)
            );
        }

        filtered.sort((a, b) => {
            if (sortOrder === 'asc') {
                return a.title.localeCompare(b.title);
            } else {
                return b.title.localeCompare(a.title);
            }
        });

        setFilteredProducts(filtered);
    };

    const handleCategorySelect = (category: string | null) => {
        setSelectedCategory(category);
        setShowCategoryMenu(false);
    };

    const handleFavoritePress = (id: number) => {
        toggleFavorite(id);
    };

    const handleProductPress = (id: number) => {
        router.push({
            pathname: '/product/[id]',
            params: { id: id.toString() },
        });
    };

    const renderCategoryChip = (category: string) => (
        <TouchableOpacity
            key={category}
            style={[
                styles.categoryChip,
                selectedCategory === category && styles.categoryChipActive,
            ]}
            onPress={() => handleCategorySelect(category)}
        >
            <ThemedText
                style={[
                    styles.categoryChipText,
                    selectedCategory === category && styles.categoryChipTextActive,
                ]}
            >
                {category}
            </ThemedText>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ThemedView style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.topBar}>
                        <TouchableOpacity style={styles.menuButton}>
                            <Feather name="menu" size={24} color="#000" />
                        </TouchableOpacity>
                        <View style={styles.searchContainer}>
                            <Feather name="search" size={18} color="#999" />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search product"
                                placeholderTextColor="#999"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>
                    </View>

                    <View style={styles.titleSection}>
                        <View style={styles.titleWithIcons}>
                            <View>
                                <ThemedText style={styles.titleText}>
                                    {selectedCategory 
                                        ? selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)
                                        : 'Products'
                                    }
                                </ThemedText>
                                <ThemedText style={styles.productCount}>
                                    {filteredProducts.length} products found
                                </ThemedText>
                            </View>
                            <View style={styles.iconButtonsGroup}>
                                <TouchableOpacity 
                                    style={styles.iconButton}
                                    onPress={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                >
                                    <Feather name={sortOrder === 'asc' ? 'arrow-down' : 'arrow-up'} size={20} color="#000" />
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={styles.iconButton}
                                    onPress={() => setShowCategoryMenu(!showCategoryMenu)}
                                >
                                    <Feather name="sliders" size={20} color="#000" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {showCategoryMenu && (
                        <View style={styles.categoryDropdown}>
                            <FlatList
                                scrollEnabled={true}
                                data={['all', ...categories]}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[
                                            styles.categoryDropdownItem,
                                            (item === 'all' ? !selectedCategory : selectedCategory === item) && styles.categoryDropdownItemActive,
                                        ]}
                                        onPress={() => handleCategorySelect(item === 'all' ? null : item)}
                                    >
                                        <ThemedText
                                            style={[
                                                styles.categoryDropdownText,
                                                (item === 'all' ? !selectedCategory : selectedCategory === item) && styles.categoryDropdownTextActive,
                                            ]}
                                        >
                                            {item === 'all' ? 'All' : item.charAt(0).toUpperCase() + item.slice(1)}
                                        </ThemedText>
                                    </TouchableOpacity>
                                )}
                                keyExtractor={item => item}
                                nestedScrollEnabled={true}
                            />
                        </View>
                    )}
                </View>

                <FlatList
                    data={filteredProducts}
                    renderItem={({ item }) => (
                        <ProductCard
                            product={item}
                            onPress={handleProductPress}
                            onFavoritePress={handleFavoritePress}
                            isFavorite={favorites.has(item.id)}
                        />
                    )}
                    keyExtractor={item => item.id.toString()}
                    numColumns={2}
                    columnWrapperStyle={styles.columnWrapper}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <ThemedText style={styles.emptyText}>No products found</ThemedText>
                        </View>
                    }
                    contentContainerStyle={styles.flatListContent}
                />
            </ThemedView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
        flexDirection: 'column',
    },
    flatListContent: {
        paddingBottom: 20,
    },
    header: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 16,
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    menuButton: {
        width: 40,
        height: 40,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 40,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 14,
        color: '#000',
    },
    titleSection: {
        marginBottom: 16,
        position: 'relative',
    },
    titleWithIcons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 12,
    },
    iconButtonsGroup: {
        flexDirection: 'row',
        gap: 8,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
    },
    titleText: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 4,
    },
    productCount: {
        fontSize: 13,
        color: '#666',
    },
    categoriesContainer: {
        marginBottom: 12,
    },
    categoriesList: {
        paddingHorizontal: 0,
        gap: 8,
    },
    categoryModal: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
        zIndex: 1000,
    },
    categoryDropdown: {
        position: 'absolute',
        top: 60,
        right: 12,
        backgroundColor: '#fff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 5,
        zIndex: 1000,
        minWidth: 180,
        maxWidth: 250,
        maxHeight: 300,
    },
    categoryDropdownItem: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    categoryDropdownItemActive: {
        backgroundColor: '#000',
    },
    categoryDropdownText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    categoryDropdownTextActive: {
        color: '#fff',
    },
    categoryModalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        paddingBottom: 24,
        maxHeight: '70%',
    },
    categoryModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    categoryModalTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    categoryModalClose: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryModalList: {
        paddingHorizontal: 16,
        paddingTop: 16,
        gap: 8,
    },
    categoryChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    categoryChipActive: {
        backgroundColor: '#000',
        borderColor: '#000',
    },
    categoryChipText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#666',
        textTransform: 'capitalize',
    },
    categoryChipTextActive: {
        color: '#fff',
    },
    columnWrapper: {
        justifyContent: 'space-between',
        paddingHorizontal: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
