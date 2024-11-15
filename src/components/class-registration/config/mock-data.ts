export const mockClassData = {
  title: "Masterclass de Pádel para Todas las Edades",
  description: `¡Bienvenido a nuestra clase especial de pádel diseñada para toda la familia! 

Esta experiencia única está adaptada para participantes de todas las edades y niveles, desde principiantes hasta jugadores intermedios. Los niños aprenderán las bases del deporte de una manera divertida y dinámica, mientras que los adultos podrán perfeccionar su técnica a su propio ritmo.

Durante las sesiones, trabajaremos en:
• Técnicas básicas y avanzadas de golpes
• Posicionamiento en la cancha y estrategia de juego
• Ejercicios específicos adaptados a cada nivel
• Dinámicas grupales y mini-torneos

Nuestro método de enseñanza personalizado garantiza que cada participante progrese y disfrute del aprendizaje, creando un ambiente inclusivo y motivador para todos.`,
  instructor: {
    name: "Juan Pérez",
    role: "Instructor Principal"
  },
  details: {
    totalSessions: 8,
    startDate: new Date(2024, 3, 15),
    spots: 6
  }
} as const 