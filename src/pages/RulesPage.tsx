import { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, HelpCircle, Moon, Sun, Users, Skull, Scroll } from 'lucide-react';

function Collapsible({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card border-dark-200">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between text-left gap-3"
      >
        <div className="flex items-center gap-3">
          {icon}
          <h2 className="font-gothic text-gothic-100 text-base">{title}</h2>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gothic-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gothic-400 flex-shrink-0" />}
      </button>
      {open && <div className="mt-4 border-t border-dark-200 pt-4 text-gothic-300 text-sm leading-relaxed space-y-3">{children}</div>}
    </div>
  );
}

function Rule({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-gothic text-gothic-100 mb-1">{title}</p>
      <div className="text-gothic-400 text-sm leading-relaxed pl-3 border-l border-dark-200">{children}</div>
    </div>
  );
}

export default function RulesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <BookOpen className="w-8 h-8 text-blood-500" />
        <div>
          <h1 className="page-title">Cómo se juega</h1>
          <p className="text-gothic-400 text-sm">Guía rápida y preguntas frecuentes de Blood on the Clocktower</p>
        </div>
      </div>

      {/* Intro card */}
      <div className="card border-blood-800/40 bg-blood-950/10">
        <p className="text-gothic-300 leading-relaxed">
          <strong className="text-gothic-100">Blood on the Clocktower</strong> es un juego de rol social de deducción para 5–20 jugadores.
          Un jugador hace de <strong className="text-gold-400">Narrador</strong> (Storyteller) y el resto encarna a personajes del pueblo de <em>Ravenswood Bluff</em>.
          El objetivo: <span className="text-blue-300">el Bien</span> debe ejecutar al Demonio, mientras que <span className="text-red-300">el Mal</span> debe sobrevivir hasta que solo queden 2 jugadores vivos.
        </p>
      </div>

      {/* Sections */}
      <Collapsible title="Estructura de la partida" icon={<Scroll className="w-5 h-5 text-gold-400" />}>
        <Rule title="Preparación">
          El Narrador elige un script, asigna roles en secreto y prepara la mesa con los tokens. Los jugadores <strong>no conocen</strong> los roles de los demás, solo el suyo.
        </Rule>
        <Rule title="Primera Noche">
          El Narrador guía el orden nocturno: algunos personajes reciben información (Empático, Lavandera…) y otros actúan (Envenenadora…). Los jugadores cierran los ojos y solo abren cuando el Narrador les indica.
        </Rule>
        <Rule title="Día">
          Los jugadores debaten libremente. Cualquiera puede nominar a alguien para ejecutarlo. Si se alcanzan suficientes votos (≥ mitad de vivos), esa persona es ejecutada. <strong>Solo puede haber una ejecución por día.</strong>
        </Rule>
        <Rule title="Noche">
          El Demonio elige a quién matar. Otros personajes también actúan. Al amanecer, el Narrador anuncia quién ha muerto (o que no ha muerto nadie).
        </Rule>
        <Rule title="Condición de victoria">
          <ul className="list-disc list-inside space-y-1 mt-1">
            <li><span className="text-blue-300">El Bien gana</span> si el Demonio es ejecutado durante el día.</li>
            <li><span className="text-red-300">El Mal gana</span> si solo quedan 3 jugadores vivos (2 vivos + inicio del día, dependiendo del script).</li>
          </ul>
        </Rule>
      </Collapsible>

      <Collapsible title="Tipos de personajes" icon={<Users className="w-5 h-5 text-blue-400" />}>
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-blue-950/20 border border-blue-900/30">
            <p className="font-gothic text-blue-300 mb-1">🏘️ Aldeanos (Townsfolk)</p>
            <p>Equipo del Bien. Tienen habilidades que dan información o protegen al pueblo. Son los principales detectores de mentiras.</p>
          </div>
          <div className="p-3 rounded-lg bg-purple-950/20 border border-purple-900/30">
            <p className="font-gothic text-purple-300 mb-1">🧳 Forasteros (Outsiders)</p>
            <p>Equipo del Bien, pero sus habilidades suelen ser perjudiciales o neutrales para el pueblo. Complican la deducción.</p>
          </div>
          <div className="p-3 rounded-lg bg-orange-950/20 border border-orange-900/30">
            <p className="font-gothic text-orange-300 mb-1">😈 Esbirros (Minions)</p>
            <p>Equipo del Mal. Conocen quién es el Demonio. Sus habilidades obstaculizan al pueblo: envenenan, matan, bloquean información…</p>
          </div>
          <div className="p-3 rounded-lg bg-red-950/20 border border-red-900/30">
            <p className="font-gothic text-red-300 mb-1">👹 Demonio (Demon)</p>
            <p>Jefe del Mal. Mata una persona cada noche. Si muere ejecutado, el Bien gana. Conoce a sus Esbirros y recibe 3 bluffs del Narrador.</p>
          </div>
          <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-900/30">
            <p className="font-gothic text-amber-300 mb-1">⚗️ Lorics</p>
            <p>Personajes especiales de una expansión no oficial. Modifican las reglas base de formas únicas. El Narrador decide si incluirlos.</p>
          </div>
        </div>
      </Collapsible>

      <Collapsible title="El papel del Narrador" icon={<Moon className="w-5 h-5 text-blue-400" />}>
        <Rule title="Imparcialidad">
          El Narrador <strong>no gana ni pierde</strong>. Su trabajo es que la partida sea justa, divertida e interesante para todos los jugadores.
        </Rule>
        <Rule title="Información">
          El Narrador nunca miente directamente. Si un personaje recibe información incorrecta, es porque está <em>envenenado</em> o tiene una habilidad que lo permite.
        </Rule>
        <Rule title="Discreción">
          El Narrador mantiene en secreto quién actuó en la noche y qué información se dio. Solo dice quién ha muerto al amanecer.
        </Rule>
        <Rule title="Flexibilidad">
          Algunos personajes dan al Narrador opciones (p.ej. el Barón añade 2 Forasteros). El Narrador puede elegir la opción que más enriquezca la partida.
        </Rule>
        <Rule title="Bluffs para el Demonio">
          En la Primera Noche, el Narrador da al Demonio 3 personajes «coartada» (del Bien, no en juego) para que pueda mentir de forma creíble sobre su rol.
        </Rule>
      </Collapsible>

      <Collapsible title="Nominaciones y ejecuciones" icon={<Sun className="w-5 h-5 text-yellow-400" />}>
        <Rule title="Nominar">
          Cualquier jugador <strong>vivo</strong> puede nominar a otro jugador vivo (que no haya sido nominado hoy). El nominador tampoco puede nominar si ya ha nominado hoy.
        </Rule>
        <Rule title="Votar">
          Tras una nominación, todos los jugadores vivos pueden votar a favor. Los jugadores muertos conservan <strong>un voto fantasma</strong> que pueden usar una sola vez.
        </Rule>
        <Rule title="Umbral de ejecución">
          Se necesitan votos ≥ la mitad de los jugadores <em>vivos</em> (redondeando hacia arriba). Si varios nominados alcanzan el umbral, solo muere quien tenga más votos.
        </Rule>
        <Rule title="Sin ejecución">
          El pueblo puede optar por no ejecutar a nadie ese día.
        </Rule>
      </Collapsible>

      <Collapsible title="Muertes y jugadores muertos" icon={<Skull className="w-5 h-5 text-red-400" />}>
        <Rule title="Anuncio de muerte">
          Al amanecer el Narrador anuncia quién ha muerto (o que nadie ha muerto). No revela el rol del muerto salvo que la regla del personaje lo indique.
        </Rule>
        <Rule title="Jugadores muertos">
          Los muertos <strong>siguen participando</strong>: pueden hablar, debatir y usar su voto fantasma una vez. No pueden nominar ni ser nominados.
        </Rule>
        <Rule title="Revelación de rol">
          Cuando alguien muere (por cualquier causa), puede optar por revelar su token de rol, pero no está obligado.
        </Rule>
      </Collapsible>

      <Collapsible title="❓ Preguntas frecuentes (FAQ)" icon={<HelpCircle className="w-5 h-5 text-green-400" />}>
        <div className="space-y-4">
          {[
            {
              q: '¿Puedo mentir sobre mi personaje?',
              a: 'Sí, completamente. Cualquier jugador puede mentir, inventarse información o fingir ser otro personaje. El Narrador es el único que nunca miente directamente.',
            },
            {
              q: '¿El Narrador puede revelar información voluntariamente?',
              a: 'No. El Narrador solo da información cuando la mecánica de un personaje lo requiere. Nunca confirma ni desmiente lo que dicen los jugadores.',
            },
            {
              q: '¿Qué pasa si el Demonio muere por la noche (p.ej. Cazadora)?',
              a: 'El Bien gana inmediatamente, igual que si fuera ejecutado durante el día.',
            },
            {
              q: '¿El Barón cuenta como Esbirro adicional?',
              a: 'Sí. El Barón ocupa una plaza de Esbirro y además añade 2 Forasteros al juego (quitando 2 Aldeanos de la distribución base).',
            },
            {
              q: '¿Los jugadores muertos saben quién es el Demonio?',
              a: 'Solo si tienen una habilidad que lo permita (p.ej. el Espía). En general, los muertos conservan solo la información que tenían en vida.',
            },
            {
              q: '¿Se puede ganar sin ejecutar al Demonio?',
              a: 'Depende del script. En la mayoría, el Bien solo gana ejecutando al Demonio. Algunos personajes especiales tienen condiciones alternativas.',
            },
            {
              q: '¿Cuándo actúa el Narrador en la noche si hay personajes envenenados?',
              a: 'El Narrador sigue llamando al personaje envenenado en su turno nocturno, pero puede dar información falsa o simplemente no ejecutar su efecto.',
            },
            {
              q: '¿Puede el Demonio matar a sus propios Esbirros?',
              a: 'Sí, aunque normalmente no le conviene. Podría hacerlo para crear confusión o si el personaje del Esbirro le perjudica.',
            },
            {
              q: '¿Cuántos jugadores necesito para jugar?',
              a: 'El mínimo son 5 jugadores. Con 5-6 se recomienda Trouble Brewing. La experiencia óptima suele ser entre 8-12 jugadores.',
            },
          ].map(({ q, a }) => (
            <div key={q} className="bg-dark-500 border border-dark-200 rounded-lg p-3">
              <p className="font-gothic text-gothic-100 text-sm mb-1.5">❓ {q}</p>
              <p className="text-gothic-400 text-sm leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </Collapsible>
    </div>
  );
}
