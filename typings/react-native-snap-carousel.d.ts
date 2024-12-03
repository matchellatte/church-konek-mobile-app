declare module 'react-native-snap-carousel' {
    import { Component } from 'react';
    import { ScrollViewProps, StyleProp, ViewStyle } from 'react-native';
  
    interface CarouselProps<T> {
      data: T[];
      renderItem: (item: { item: T; index: number }) => JSX.Element;
      sliderWidth: number;
      itemWidth: number;
      loop?: boolean;
      autoplay?: boolean;
      autoplayInterval?: number;
      inactiveSlideScale?: number;
      inactiveSlideOpacity?: number;
      containerCustomStyle?: StyleProp<ViewStyle>;
      contentContainerCustomStyle?: StyleProp<ViewStyle>;
      scrollInterpolator?: (index: number, props: CarouselProps<T>) => {};
      slideInterpolatedStyle?: (index: number, animatedValue: any, props: CarouselProps<T>) => StyleProp<ViewStyle>;
      useScrollView?: boolean;
      onSnapToItem?: (index: number) => void;
      scrollEnabled?: boolean;
      vertical?: boolean;
    }
  
    export default class Carousel<T> extends Component<CarouselProps<T>> {}
  }
  