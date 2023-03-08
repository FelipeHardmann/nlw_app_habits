import  dayjs  from 'dayjs'
import { FastifyInstance } from "fastify"
import { prisma } from "./lib/prisma"
import { z } from 'zod'

export async function appRoutes(app: FastifyInstance){
    app.post('/habits', async (request) => {
    // Title, weekdays
        const creatHabitBody = z.object({
            title: z.string(),
            weekDays: z.array(
                z.number().min(0).max(6) // Os dias da semana vão de Domingo == 0 a Sábado == 6
                )
        })
    
        const { title, weekDays } = creatHabitBody.parse(request.body)

        const today = dayjs().startOf('day').toDate()
        // StartOf -> Zera as horas, minutos e segundos
        // toDate -> Transforma em objeto data

        await prisma.habit.create({
            data: {
                title,
                created_at: today,
                weekDays: {
                    create: weekDays.map(weekDay =>{
                        return{
                            week_day: weekDay,
                        }
                    })
                }
            }
        })
    })
    
    app.get('/day', async (request) => {
        const getDayParams = z.object({
            date: z.coerce.date() // Vai converter o parametro em uma data
        })

        const { date } = getDayParams.parse(request.query)
        
        const parsedDate = dayjs(date).startOf('day')
        const weekDay = parsedDate.get('day')
        // Day retorna dia da semana, date retorna a data  


        // Todos os hábitos possíveis daquele dia
        // Hábitos que já foram completados

        const possibleHabits = await prisma.habit.findMany({
            where: {
                created_at: {
                    lte: date,
                },
                weekDays: {
                    some: {
                        week_day: weekDay,
                    }
                }
            }
        })
 
        const day = await prisma.day.findUnique({
            where: {
                date: parsedDate.toDate()
            },
            include: {
                dayHabits: true
            }
        })

        const completedHabits = day?.dayHabits.map(dayHabit => {
            return dayHabit.habit_id
        }) ?? []

        return {
            possibleHabits,
            completedHabits
        }
    })

    app.patch('/habits/:id/toggle', async (request) => {
        // O id significa que é um paramêtro de identficação
        
        const toggleHabitsParams = z.object({
            id: z.string().uuid(),
        })

        const { id } = toggleHabitsParams.parse(request.params)
    
        const today = dayjs().startOf('day').toDate()

        let day = await prisma.day.findUnique({
            where: {
                date: today,
            }
        })

        if (!day){
            day = await prisma.day.create({
                data: {
                    date: today,
                }
            })
        }


        const dayHabit = await prisma.dayHabits.findUnique({
            where: {
                day_id_habit_id: {
                    day_id: day.id,
                    habit_id: id
                }
            }
        })

        if (dayHabit){
            await prisma.dayHabits.delete({
                where: {
                    id: dayHabit.id
                }
            })
        }else{
            await prisma.dayHabits.create({
                data: {
                    day_id: day.id,
                    habit_id: id 
                }
            })
        }
    })

    app.get('/summary', async () => {
        const summary = await prisma.$queryRaw`
            SELECT 
                D.id, 
                D.date,
                (
                    SELECT 
                        cast(count(*) as float)
                    FROM day_habits DH
                    WHERE 
                        DH.day_id = D.id
                ) as completed,
                (
                    SELECT 
                        cast(count(*) as float)
                    FROM habits_week_days HWD
                    JOIN habits H
                        ON H.id = HWD.habit_id
                    WHERE 
                        HWD.week_day = cast(strftime('%w', D.date/1000.0, 'unixepoch') as int)
                        AND H.created_at < D.date
                )as amount
            FROM days D
        `

        return summary
    })

}

