/// <reference types="nativewind/types" />

import 'react-native';

declare module 'react-native' {
  interface ViewProps {
    className?: string;
  }
  interface TextProps {
    className?: string;
  }
  interface ImageProps {
    className?: string;
  }
  interface TouchableOpacityProps {
    className?: string;
  }
  interface TextInputProps {
    className?: string;
  }
}

import 'react-native-safe-area-context';

declare module 'react-native-safe-area-context' {
  export interface NativeSafeAreaViewProps {
    className?: string;
  }
}

