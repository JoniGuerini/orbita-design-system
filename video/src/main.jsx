import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { useAnimationFrame, useMotionValue, useMotionValueEvent } from 'motion/react';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter-tight/500.css';
import '@fontsource/inter-tight/600.css';
import '@fontsource/inter-tight/700.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import '../../ds/ds.css';
import './video.css';
import { Scene, TimeContext } from './time.jsx';
import { DURATION } from './timeline.js';
import { Colors, Intro, Numbers, Outro, Type } from './scenes/basics.jsx';
import { Icons } from './scenes/icons.jsx';
import { Chat, Components, Forms, Overlays, Table } from './scenes/components.jsx';
import { Charts, Dashboard } from './scenes/charts.jsx';

// [nome na TIMELINE, cena, classe do palco, saída]
const SCENES = [
  ['intro', Intro, 'intro'],
  ['colors', Colors, 'split'],
  ['type', Type, 'type'],
  ['icons', Icons, 'icons'],
  ['components', Components, 'components'],
  ['forms', Forms, 'center'],
  ['overlays', Overlays, 'center'],
  ['table', Table],
  ['chat', Chat, 'chat'],
  ['dashboard', Dashboard],
  ['charts', Charts],
  ['numbers', Numbers, 'numbers'],
  ['outro', Outro, 'outro', 0.8],
];

const params = new URLSearchParams(location.search);
const RENDER = params.has('render'); // o render.mjs controla o relógio
const START = Number(params.get('t') ?? 0);

/**
 * Animações CSS do DS (entrada dos gráficos, pontinhos de “escrevendo”) ficam pausadas
 * e são posicionadas pelo relógio: cada uma conta a partir do data-anim-start mais próximo.
 */
function syncAnimations(t) {
  for (const a of document.getAnimations()) {
    if (typeof CSSTransition !== 'undefined' && a instanceof CSSTransition) continue;
    const host = a.effect?.target?.closest?.('[data-anim-start]');
    const start = host ? Number(host.dataset.animStart) : 0;
    a.pause();
    a.currentTime = Math.max(0, (t - start) * 1000);
  }
}

function Clock({ time }) {
  useAnimationFrame((_, delta) => {
    if (RENDER) return;
    time.set((time.get() + Math.min(delta, 50) / 1000) % DURATION);
  });
  useMotionValueEvent(time, 'change', syncAnimations);
  return null;
}

function App() {
  const time = useMotionValue(START);
  if (RENDER) {
    window.__duration = DURATION;
    window.__seek = (t) => {
      time.set(t);
      syncAnimations(t);
    };
    window.__sync = () => syncAnimations(time.get());
  }
  return (
    <TimeContext.Provider value={time}>
      <Clock time={time} />
      <div className={`stage${RENDER ? ' stage--render' : ''}`}>
        {SCENES.map(([name, Body, className, exit]) => (
          <Scene key={name} name={name} className={className} exit={exit}>
            <Body />
          </Scene>
        ))}
      </div>
    </TimeContext.Provider>
  );
}

document.fonts.ready.then(() => {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
  window.__ready = true;
});
