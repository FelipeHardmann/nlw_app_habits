import { StatusBar } from 'react-native';
import { useFonts, 
  Inter_400Regular, 
  Inter_600SemiBold, 
  Inter_700Bold, 
  Inter_800ExtraBold
} from '@expo-google-fonts/inter'

import { Loading } from './src/components/Loading';
import { Routes } from './src/routes';

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular, 
    Inter_600SemiBold, 
    Inter_700Bold, 
    Inter_800ExtraBold
  })

// Forma de garantir o carregamento das fontes
// Se não estiver disponível não irá carregar

  if(!fontsLoaded){
    return(
      <Loading/>
    )
  } 

  return (
    // Isso é conhecido como fragment que serve para encapsular todo o componente
    // Serve de estratégia pois a função só consegue retornar apenas um elemento
    <>
      <Routes/>
      <StatusBar barStyle="light-content" backgroundColor={'transparent'} translucent />
    </>
  );
}

