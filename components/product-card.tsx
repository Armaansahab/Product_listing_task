import { Product } from '@/types/product';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './themed-text';

interface ProductCardProps {
  product: Product;
  onPress: (id: number) => void;
  onFavoritePress?: (id: number) => void;
  isFavorite?: boolean;
}

export function ProductCard({ product, onPress, onFavoritePress, isFavorite = false }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => onPress(product.id)}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.image }}
          style={styles.image}
          onError={() => setImageError(true)}
        />
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={(e) => {
            e.stopPropagation();
            onFavoritePress?.(product.id);
          }}
        >
          <Feather 
            name={isFavorite ? 'heart' : 'heart'} 
            size={24} 
            color={isFavorite ? '#ff6b6b' : '#999'}
            fill={isFavorite ? '#ff6b6b' : 'none'}
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <ThemedText 
          type="defaultSemiBold" 
          numberOfLines={2}
          style={styles.title}
        >
          {product.title}
        </ThemedText>
        
        <View style={styles.ratingContainer}>
          <ThemedText style={styles.rating}>
            {'⭐ '}{product.rating.rate}
          </ThemedText>
          <ThemedText style={styles.ratingCount}>
            ({product.rating.count})
          </ThemedText>
        </View>
        
        <ThemedText 
          type="default" 
          numberOfLines={2}
          style={styles.category}
        >
          {product.category}
        </ThemedText>
        
        <ThemedText 
          type="defaultSemiBold" 
          style={styles.price}
        >
          ${product.price.toFixed(2)}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    marginHorizontal: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    backgroundColor: '#f5f5f5',
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    lineHeight: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rating: {
    fontSize: 12,
    fontWeight: '600',
  },
  ratingCount: {
    fontSize: 11,
    color: '#999',
    marginLeft: 4,
  },
  category: {
    fontSize: 11,
    color: '#666',
    marginBottom: 6,
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
});
