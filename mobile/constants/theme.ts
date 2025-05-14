import { useColorScheme } from 'react-native';

export const useTheme = () => {
  const colorScheme = useColorScheme();

  const colors = {
    background: colorScheme === 'dark' ? '#121212' : '#FFFFFF',
    text: colorScheme === 'dark' ? '#E0E0E0' : '#000000',
    inputBackground: colorScheme === 'dark' ? '#1E1E1E' : '#F5F5F5',
    inputBorder: colorScheme === 'dark' ? '#333333' : '#DDDDDD',
    buttonBackground: colorScheme === 'dark' ? '#BB86FC' : '#6200EE',
    buttonText: '#FFFFFF',
    avatarBackground: colorScheme === 'dark' ? '#BB86FC' : '#6200EE',
    avatarText: '#FFFFFF',
  };

  return { colors };
};
