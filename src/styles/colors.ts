export interface ColorPalette {
  background: string;
  card: string;
  text: string;
  primary: string;
  border: string;
  notification: string;
  statusBar: 'light-content' | 'dark-content';
  skeletonBackground: string;
  skeletonHighlight: string;
}

export const lightColors: ColorPalette = {
  background: '#F2F2F7', // System Gray 6 Light
  card: '#FFFFFF', // White
  text: '#000000', // Black
  primary: 'rgba(255,0,0,1)', // System Red Light
  border: '#C6C6C8', // System Gray 3 Light
  notification: '#FF3B30', // System Red Light
  statusBar: 'dark-content',
  skeletonBackground: '#E1E9EE', // Default light skeleton background
  skeletonHighlight: '#F2F8FC', // Default light skeleton highlight
};

export const darkColors: ColorPalette = {
  background: '#000000', // Black
  card: '#1C1C1E', // System Gray 6 Dark
  text: '#FFFFFF', // White
  primary: 'rgba(204,0,0,1)', // System Red Dark
  border: '#38383A', // System Gray 3 Dark
  notification: '#FF453A', // System Red Dark
  statusBar: 'light-content',
  skeletonBackground: '#2C2C2E', // Darker gray for dark mode skeleton background
  skeletonHighlight: '#3A3A3C', // Darker gray for dark mode skeleton highlight
};