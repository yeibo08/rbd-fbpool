import { useState } from "react";
import { Link } from "react-router-dom";

const FAQ_ITEMS = [
  {
    q: "¿Cómo funciona la quiniela?",
    a: "Cada participante pronostica el marcador exacto de los 104 partidos del Mundial 2026. Después de cada partido, el sistema calcula los puntos según las reglas del grupo. Al final del torneo, quien tenga más puntos gana.",
  },
  {
    q: "¿Cómo se calculan los puntos?",
    a: "Cada grupo puede personalizar sus reglas, pero por defecto se otorga 1 punto por: acertar el resultado (victoria local, empate o victoria visitante), acertar los goles exactos del equipo local, acertar los goles exactos del equipo visitante, y acertar el total de goles del partido. El máximo es 4 puntos por partido con las reglas por defecto.",
  },
  {
    q: "¿Cuándo se cierra el pronóstico de un partido?",
    a: "Los pronósticos se cierran 15 minutos antes del pitido inicial. Una vez cerrado, tu predicción queda guardada pero no puede modificarse. Si no hiciste un pronóstico antes del cierre, recibes 0 puntos para ese partido.",
  },
  {
    q: "¿Puedo cambiar mi pronóstico?",
    a: "Sí, puedes actualizar tu pronóstico cuantas veces quieras antes de que cierre el partido (15 minutos antes del inicio). Solo cuenta el último pronóstico guardado.",
  },
  {
    q: "¿Qué pasa si el partido va a penales?",
    a: "Para los partidos de eliminación directa que llegan a penales, el equipo ganador en los penales se considera el ganador del partido para el criterio de 'resultado'. Los goles de los penales NO cuentan para los criterios de goles — solo se toman en cuenta los goles del tiempo reglamentario y la prórroga.",
  },
  {
    q: "¿Cómo invito a mis amigos?",
    a: "En la página de tu grupo encontrarás un enlace de invitación. Cópialo y compártelo por WhatsApp, iMessage o como prefieras. Cualquier persona con el enlace puede unirse al grupo, siempre que haya espacio (máximo 20 participantes). El propietario o un gestor puede regenerar el enlace en cualquier momento para invalidar el anterior.",
  },
  {
    q: "¿Cuántos grupos puedo tener?",
    a: "Puedes crear o unirte a tantos grupos como quieras. Cada grupo tiene su propio marcador, reglas de puntuación y pronósticos independientes.",
  },
  {
    q: "¿Qué es la Tabla de grupos?",
    a: "La Tabla de grupos muestra las posiciones de los 48 equipos en sus 12 grupos (A–L) con estadísticas completas: partidos jugados, victorias, empates, derrotas, goles a favor, goles en contra, diferencia de goles y puntos. Las filas verdes indican clasificación directa a la Ronda de 32; la fila amarilla marca al posible tercer lugar. Tiene dos vistas: 'Oficial' con los resultados reales del torneo, y 'Mis pronósticos' con la tabla simulada a partir de tus predicciones.",
  },
  {
    q: "¿Cómo funciona el Bracket?",
    a: "El Bracket muestra el cuadro completo de eliminación directa: Ronda de 32 (16 partidos), Octavos, Cuartos, Semis, 3er lugar y Final. Se llena automáticamente a medida que haces pronósticos en la fase de grupos: el sistema simula las posiciones, determina los 32 clasificados (los 2 mejores de cada grupo más los 8 mejores terceros según el reglamento FIFA 2026) y los coloca en los cruces oficiales. A medida que pronostiques los partidos de eliminación, los equipos ganadores avanzan automáticamente en el cuadro.",
  },
  {
    q: "¿Los resultados del bracket reflejan mis pronósticos o los resultados reales?",
    a: "Siempre prevalecen los resultados oficiales cuando el partido ya se jugó. Para partidos aún sin resultado, el bracket usa tu pronóstico para avanzar equipos. Si no pronosticaste un partido, esa casilla queda como 'Por definir'. Los marcadores con asterisco (*) en el bracket son pronósticos pendientes de confirmación oficial.",
  },
  {
    q: "¿Qué es el Ranking de mis amigos?",
    a: "Es la tabla de posiciones de tu grupo: muestra a todos los participantes ordenados por puntos acumulados en los partidos ya jugados. Se actualiza automáticamente conforme avanza el torneo.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left py-4 flex items-center justify-between gap-4"
      >
        <span className="text-sm font-medium text-gray-900">{q}</span>
        <span className="text-gray-400 text-lg flex-shrink-0">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <p className="text-sm text-gray-600 pb-4 leading-relaxed">{a}</p>
      )}
    </div>
  );
}

export default function Faq() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <Link to="/grupos" className="text-gray-500 hover:text-gray-700 text-sm">← Mis grupos</Link>
        <span className="text-gray-300">/</span>
        <span className="font-medium text-gray-900 text-sm">Ayuda</span>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Preguntas frecuentes</h1>
        <p className="text-sm text-gray-500 mb-8">Todo lo que necesitas saber para participar en la Quiniela Mundial 2026.</p>

        <div className="bg-white rounded-xl border border-gray-200 px-4">
          {FAQ_ITEMS.map((item) => (
            <FaqItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      </main>
    </div>
  );
}
