import { useColorScheme } from 'react-native';
import { darkColors, lightColors, type ColorPalette } from '../styles/colors';

export const useTheme = (): ColorPalette => {
  const scheme = useColorScheme();
  return scheme === 'dark' ? darkColors : lightColors;
};