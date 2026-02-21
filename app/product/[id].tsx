import { Feather, MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { apiService } from '@/services/api';
import { Product } from '@/types/product';

export default function ProductDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [isExpanded, setIsExpanded] = useState(false);
    const DESCRIPTION_LIMIT = 140;

    useEffect(() => {
        loadProduct();
    }, [id]);

    const loadProduct = async () => {
        try {
            setLoading(true);
            if (id) {
                const data = await apiService.getProductById(Number(id));
                setProduct(data);
            }
        } catch (error) {
            console.error('Error loading product:', error);
            Alert.alert('Error', 'Failed to load product details');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = () => {
        Alert.alert('Success', `Added ${quantity} item(s) to cart`);
        setQuantity(1);
    };

    const handleQuantityChange = (operation: 'increase' | 'decrease') => {
        if (operation === 'increase') {
            setQuantity(quantity + 1);
        } else if (quantity > 1) {
            setQuantity(quantity - 1);
        }
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

    if (!product) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.loadingContainer}>
                    <ThemedText>Product not found</ThemedText>
                </View>
            </SafeAreaView>
        );
    }

    const renderStars = (rate: number) => {
        const stars = [];
        const fullStars = Math.floor(rate);
        const hasHalfStar = rate % 1 !== 0;

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(
                    <MaterialIcons key={i} name="star" size={20} color="#FFD700" />
                );
            } else if (i === fullStars && hasHalfStar) {
                stars.push(
                    <MaterialIcons key={i} name="star-half" size={20} color="#FFD700" />
                );
            } else {
                stars.push(
                    <MaterialIcons key={i} name="star-outline" size={20} color="#D0D0D0" />
                );
            }
        }
        return stars;
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ThemedView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Feather name="chevron-left" size={28} color="#000" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.favoriteButton}
                        onPress={() => setIsFavorite(!isFavorite)}
                    >
                        <Feather
                            name={isFavorite ? 'heart' : 'heart'}
                            size={24}
                            color={isFavorite ? '#ff6b6b' : '#000'}
                            fill={isFavorite ? '#ff6b6b' : 'none'}
                        />
                    </TouchableOpacity>
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <View style={styles.imageSection}>
                        <Image
                            source={{ uri: product.image }}
                            style={styles.productImage}
                        />
                    </View>

                    <View style={styles.contentSection}>
                        <View style={styles.categoryBadge}>
                            <ThemedText style={styles.categoryText}>
                                {product.category}
                            </ThemedText>
                        </View>

                        <ThemedText style={styles.title}>
                            {product.title}
                        </ThemedText>
                        <ThemedText style={styles.description}>
                            {isExpanded
                                ? product.description
                                : product.description.slice(0, DESCRIPTION_LIMIT)}

                            {product.description.length > DESCRIPTION_LIMIT && (
                                <ThemedText
                                    style={{ color: '#000000', fontWeight: '600' }}
                                    onPress={() => setIsExpanded(!isExpanded)}
                                >
                                    {isExpanded ? ' Read Less' : '... Read More'}
                                </ThemedText>
                            )}
                        </ThemedText>

                        <ThemedText style={styles.sectionTitle}>
                            Rating
                        </ThemedText>

                        <View style={styles.ratingContainer}>
                            <View style={styles.starsContainer}>
                                {renderStars(product.rating.rate)}
                            </View>
                            <ThemedText style={styles.rating}>
                                {product.rating.rate}
                            </ThemedText>
                            <ThemedText style={styles.ratingCount}>
                                ({product.rating.count})
                            </ThemedText>
                        </View>
                    </View>
                </ScrollView>

                <View style={styles.bottomSection}>
                    <TouchableOpacity
                        style={styles.addToCartButton}
                        onPress={handleAddToCart}
                    >
                        <ThemedText style={styles.addToCartText}>
                            ADD TO CART
                        </ThemedText>
                    </TouchableOpacity>
                </View>
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
        justifyContent: 'space-between',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    favoriteButton: {
        width: 40,
        height: 40,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        flexGrow: 1,
    },
    imageSection: {
        backgroundColor: '#f5f5f5',
        height: 300,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    productImage: {
        width: '80%',
        height: '100%',
        resizeMode: 'contain',
    },
    contentSection: {
        paddingHorizontal: 16,
    },
    categoryBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: 12,
    },
    categoryText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#666',
        textTransform: 'capitalize',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 12,
        lineHeight: 32,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        paddingBottom: 12,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 30,
    },
    starsContainer: {
        flexDirection: 'row',
        gap: 4,
    },
    rating: {
        fontSize: 14,
        fontWeight: '600',
    },
    ratingCount: {
        fontSize: 12,
        color: '#999',
    },
    priceContainer: {
        marginBottom: 24,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    price: {
        fontSize: 32,
        fontWeight: '700',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginTop: 20,
        marginBottom: 2,
    },
    description: {
        fontSize: 14,
        lineHeight: 21,
        color: '#666',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        paddingBottom: 12,
    },
    detailsGrid: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 24,
    },
    detailItem: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 12,
        borderRadius: 8,
    },
    detailLabel: {
        fontSize: 11,
        color: '#999',
        fontWeight: '600',
        marginBottom: 4,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    bottomSection: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    quantitySelector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        padding: 8,
    },
    quantityButton: {
        width: 32,
        height: 32,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantity: {
        fontSize: 16,
        fontWeight: '700',
        marginHorizontal: 16,
    },
    addToCartButton: {
        flex: 1,
        backgroundColor: '#000',
        borderRadius: 8,
        paddingVertical: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addToCartText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
