import { addDays, setHours, setMinutes } from "date-fns"

const generateSessions = (startDate: Date, weeks: number) => {
  return Array.from({ length: weeks }, (_, index) => ({
    date: addDays(startDate, index * 7),
    selected: false,
    totalSpots: 12,
    spotsLeft: Math.floor(Math.random() * 8) + 1 // 1-8 lugares disponibles
  }))
}

const today = new Date()
const mondayClass = setHours(setMinutes(today, 0), 18)
const wednesdayClass = setHours(setMinutes(addDays(today, 2), 0), 19)

export const mockPublicClasses = [
  {
    id: "1",
    title: "Clase de Pádel para Principiantes",
    description: "Aprende las bases del pádel en un ambiente divertido y amigable. Ideal para quienes nunca han jugado o tienen poca experiencia. Trabajaremos en técnicas básicas, reglas del juego y movimientos fundamentales.",
    instructor: "Juan Pérez",
    schedule: "Lunes y Miércoles 18:00 - 19:00",
    totalSpots: 8,
    spotsLeft: 3,
    price: 2500,
    sessions: generateSessions(mondayClass, 8)
  },
  {
    id: "2",
    title: "Pádel Intermedio",
    description: "Mejora tu técnica y estrategia de juego. Perfecto para jugadores que ya conocen los fundamentos y quieren llevar su juego al siguiente nivel. Enfoque en tácticas avanzadas y situaciones de juego real.",
    instructor: "María González",
    schedule: "Martes y Jueves 19:00 - 20:00",
    totalSpots: 6,
    spotsLeft: 0,
    price: 3000,
    sessions: generateSessions(wednesdayClass, 8)
  },
  {
    id: "3",
    title: "Clínica de Pádel Avanzado",
    description: "Perfecciona tu juego con técnicas avanzadas y estrategias competitivas. Para jugadores experimentados que buscan mejorar aspectos específicos de su juego. Incluye análisis de video y feedback personalizado.",
    instructor: "Carlos Rodríguez",
    schedule: "Sábados 10:00 - 12:00",
    totalSpots: 4,
    spotsLeft: 2,
    price: 3500,
    sessions: generateSessions(setHours(setMinutes(addDays(today, 5), 0), 10), 6)
  }
] 