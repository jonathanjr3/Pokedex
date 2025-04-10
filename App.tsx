import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { useColorScheme, StatusBar } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { useTheme } from './src/styles/useTheme';
import { lightColors, darkColors } from './src/styles/colors';

const MyLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: lightColors.primary,
    background: lightColors.background,
    card: lightColors.card,
    text: lightColors.text,
    border: lightColors.border,
    notification: lightColors.notification,
  },
};

const MyDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: darkColors.primary,
    background: darkColors.background,
    card: darkColors.card,
    text: darkColors.text,
    border: darkColors.border,
    notification: darkColors.notification,
  },
};


const App: React.FC = () => {
  const scheme = useColorScheme();
  const theme = useTheme();

  return (
    <NavigationContainer theme={scheme === 'dark' ? MyDarkTheme : MyLightTheme}>
       <StatusBar
        barStyle={theme.statusBar}
        backgroundColor={theme.background}
        translucent={true}
       />
      <AppNavigator />
    </NavigationContainer>
  );
};

export default App;