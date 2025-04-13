export interface ColorPalette {
  background: string;
  card: string;
  text: string;
  textMuted: string;
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
  textMuted: 'rgba(0,0,0,0.7)',
  primary: '#FF0000', // Red (Light)
  border: '#C6C6C8', // System Gray 3 Light
  notification: '#FF0000', // Red (Light)
  statusBar: 'dark-content',
  skeletonBackground: '#E1E9EE', // Default light skeleton background
  skeletonHighlight: '#FFDE00', // Golden Yellow (Light)
};

export const darkColors: ColorPalette = {
  background: '#000000', // Black
  card: '#1C1C1E', // System Gray 6 Dark
  text: '#FFFFFF', // White
  textMuted: 'rgba(255,255,255,0.7)',
  primary: '#CC0000', // BU Red (Dark)
  border: '#38383A', // System Gray 3 Dark
  notification: '#CC0000', // BU Red (Dark)
  statusBar: 'light-content',
  skeletonBackground: '#2C2C2E', // Darker gray for dark mode skeleton background
  skeletonHighlight: '#B3A125', // Gold Foil (Dark)
};