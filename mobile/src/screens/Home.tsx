// Componente sempre será uma função
import { useState, useEffect } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { generateDatesFromYearBeginning } from  '../utils/generate-dates-from-year-beginning'
import { api } from "../lib/axios";
import { HabitDay, DAY_SIZE } from "../components/HabitDay";
import { Header } from "../components/Header";
import { useNavigation } from "@react-navigation/native";

const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
const datesFromYearStart = generateDatesFromYearBeginning()  
const minimumSummaryDatesSizes = 18 * 5
const amountOfDaysToFill = minimumSummaryDatesSizes - datesFromYearStart.length

export function Home(){
    
    const [loading, setLoading] = useState(true)
    const [summary, setSummary] = useState(null)

    const { navigate } = useNavigation()
    


    async function fetchData() {  // Define uma função assíncrona para buscar dados da API
        try {
            setLoading(true);  // Ativa o estado de carregamento
            const response = await api.get('/summary');  // Faz uma requisição GET para a URL /summary da API
            setSummary(response.data);  // Atualiza o estado do resumo dos hábitos com os dados da resposta
            console.log(response.data);  // Exibe os dados da resposta no console do navegador
        } catch (error) {
            Alert.alert('Ops', 'Não foi possível carregar o sumário de hábitos.');  // Exibe um alerta de erro caso ocorra um problema
            console.log(error);  // Exibe o erro no console do navegador
        } finally {
            setLoading(false);  // Desativa o estado de carregamento
        }
    }

    useEffect(() => {
    fetchData();
    }, []);  // Chama a função fetchData uma única vez quando o componente é montado

    console.log('{"message":"Network Error","name":"AxiosError",...}');  // Exemplo de mensagem de erro de rede do axios
      

    return(
        <View className="flex-1 bg-background px-8 pt-16">   
            <Header/>
        
            <View className="flex-row mt-6 mb-2">
                {
                    weekDays.map((weekDay, i)=> (
                        <Text 
                            key={`${weekDay}-${i}`}
                            className="text-zinc-400 text-xl font-bold text-center mx-1"
                            style={{width: DAY_SIZE}}
                        >
                            {weekDay}
                        
                        </Text>
                    ))
                }
            </View>
            <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                <View className="flex-row flex-wrap">
                    {
                        datesFromYearStart.map(date => (
                            <HabitDay 
                                key={date.toISOString()}
                                onPress={() => navigate('habit', { date: date.toISOString() })}
                            />
                        ))
                    }
                
                {
                    amountOfDaysToFill > 0 && Array
                    .from({ length: amountOfDaysToFill })
                    .map((_, index) => (
                        <View 
                            className="bg-zinc-900 rounded-lg border-2 m-1 border-zinc-800 opacity-40"
                            style={
                                { 
                                    width: DAY_SIZE,
                                    height: DAY_SIZE
                                }
                            
                            }
                        />
                    ))
                }
                </View>
            </ScrollView>
            

        </View>
    )
}