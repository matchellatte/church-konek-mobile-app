import React from 'react';
import { View, FlatList, Image, StyleSheet, Dimensions, Platform } from 'react-native';

interface CarouselProps {
  images: string[];
  activeIndex: number;
  onScroll: (currentIndex: number) => void;
}

const Carousel: React.FC<CarouselProps> = ({ images, activeIndex, onScroll }) => {
  const { width } = Dimensions.get('window');
  const ITEM_WIDTH = width * 0.9;
  const SPACING = 2;

  return (
    <View style={styles.carouselContainer}>
      <FlatList
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={[styles.carouselItem, { width: ITEM_WIDTH, marginRight: SPACING }]}>
            <Image source={{ uri: item }} style={styles.carouselImage} />
          </View>
        )}
        onScroll={(e) => {
          const contentOffsetX = e.nativeEvent.contentOffset.x;
          const currentIndex = Math.round(contentOffsetX / (ITEM_WIDTH + SPACING));
          onScroll(currentIndex);
        }}
      />
      <View style={styles.dotsContainer}>
        {images.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              activeIndex === index ? styles.activeDot : null,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  carouselContainer: {
    padding: 10,
    marginBottom: 20,
  },
  carouselItem: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  carouselImage: {
    ...Platform.select({
        ios: {
            height: 190,
        },
        android: {
            height: 160,
        }
    }),
    width: '100%',
    borderRadius: 10,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D4A373',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#A4501B',
  },
});

export default Carousel;
