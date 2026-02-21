import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProductCard } from '@/components/product-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useFavorites } from '@/contexts/FavoritesContext';
import { apiService } from '@/services/api';
import { Product } from '@/types/product';

const { width } = Dimensions.get('window');

export default function LikedProductsScreen() {
    const router = useRouter();
    const { favorites, toggleFavorite } = useFavorites();
    const [products, setProducts] = useState<Product[]>([]);
    const [likedProducts, setLikedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProducts();
    }, []);

    useEffect(() => {
        filterLikedProducts();
    }, [products, favorites]);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const data = await apiService.getProducts();
            setProducts(data);
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterLikedProducts = () => {
        const liked = products.filter(p => favorites.has(p.id));
        setLikedProducts(liked);
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
                    <ThemedText style={styles.title}>Liked Products</ThemedText>
                    <ThemedText style={styles.productCount}>
                        {likedProducts.length} items
                    </ThemedText>
                </View>

                {likedProducts.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Feather name="heart" size={64} color="#ccc" />
                        <ThemedText style={styles.emptyTitle}>No Liked Products</ThemedText>
                        <ThemedText style={styles.emptyText}>
                            Add products to your favorites to see them here
                        </ThemedText>
                        <TouchableOpacity
                            style={styles.browseButton}
                            onPress={() => router.push('/(tabs)/products')}
                        >
                            <ThemedText style={styles.browseButtonText}>Browse Products</ThemedText>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <FlatList
                        data={likedProducts}
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
                        contentContainerStyle={styles.flatListContent}
                    />
                )}
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
    },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 4,
    },
    productCount: {
        fontSize: 13,
        color: '#666',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
    },
    browseButton: {
        backgroundColor: '#000',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    browseButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    columnWrapper: {
        gap: 16,
        paddingHorizontal: 16,
    },
    flatListContent: {
        paddingTop: 16,
        paddingBottom: 20,
        gap: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

