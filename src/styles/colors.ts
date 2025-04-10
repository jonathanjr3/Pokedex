export interface ColorPalette {
  background: string;
  card: string;
  text: string;
  primary: string;
  border: string;
  notification: string;
  statusBar: 'light-content' | 'dark-content';
}

export const lightColors: ColorPalette = {
  background: '#F2F2F7', // System Gray 6 Light
  card: '#FFFFFF', // White
  text: '#000000', // Black
  primary: '#0A84FF', // System Blue Light
  border: '#C6C6C8', // System Gray 3 Light
  notification: '#FF3B30', // System Red Light
  statusBar: 'dark-content',
};

export const darkColors: ColorPalette = {
  background: '#000000', // Black
  card: '#1C1C1E', // System Gray 6 Dark
  text: '#FFFFFF', // White
  primary: '#0A84FF', // System Blue Dark
  border: '#38383A', // System Gray 3 Dark
  notification: '#FF453A', // System Red Dark
  statusBar: 'light-content',
};