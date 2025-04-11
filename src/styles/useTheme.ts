import { useColorScheme } from 'react-native';
import { darkColors, lightColors, ColorPalette } from './colors';

export const useTheme = (): ColorPalette => {
  const scheme = useColorScheme();
  return scheme === 'dark' ? darkColors : lightColors;
};