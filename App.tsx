import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import TabLayout from './app/_layout';

function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <TabLayout />
    </NavigationContainer>
  );
}

export default App;
