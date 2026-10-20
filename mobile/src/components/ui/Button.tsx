import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from 'react-native';

const COLORS = {
  primary: '#2D5016',
  primaryDark: '#1e3a0e',
  primaryLight: '#4A7C2A',
  accent: '#8CB369',
  white: '#FFFFFF',
  border: '#EBEBEB',
  red: '#EF4444',
  redLight: '#FEF2F2',
};

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  className?: string;
  textClassName?: string;
}

export const Button = ({
  title,
  onPress,
  variant = 'primary',
  isLoading = false,
  disabled = false,
  style,
  textStyle,
  className,
  textClassName,
}: ButtonProps) => {

  const getContainerStyle = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return styles.primary;
      case 'secondary':
        return styles.secondary;
      case 'outline':
        return styles.outline;
      case 'ghost':
        return styles.ghost;
      case 'danger':
        return styles.danger;
      default:
        return styles.primary;
    }
  };

  const getTextStyle = (): TextStyle => {
    switch (variant) {
      case 'primary':
        return styles.textWhite;
      case 'secondary':
        return styles.textWhite;
      case 'outline':
        return styles.textPrimary;
      case 'ghost':
        return styles.textPrimary;
      case 'danger':
        return styles.textDanger;
      default:
        return styles.textWhite;
    }
  };

  const spinnerColor =
    variant === 'outline' || variant === 'ghost'
      ? COLORS.primary
      : variant === 'danger'
      ? COLORS.red
      : COLORS.white;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      style={[
        styles.base,
        getContainerStyle(),
        disabled && styles.disabled,
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={spinnerColor} />
      ) : (
        <Text style={[styles.baseText, getTextStyle(), textStyle]} className={textClassName}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  // Variants
  primary: {
    backgroundColor: COLORS.primary,
  },
  secondary: {
    backgroundColor: COLORS.accent,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: COLORS.red,
  },

  // States
  disabled: {
    opacity: 0.45,
  },

  // Text
  baseText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  textWhite: {
    color: COLORS.white,
  },
  textPrimary: {
    color: COLORS.primary,
  },
  textDanger: {
    color: COLORS.red,
  },
});