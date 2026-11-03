import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { useAnimationFrame, useMotionValue } from 'motion/react';
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
import { TimeContext } from './time.jsx';
import { Charts, Colors, Components, DURATION, Intro, Numbers, Outro, Type } from './scenes.jsx';

const params = new URLSearchParams(location.search);
const RENDER = params.has('render'); // o render.mjs controla o relógio
const START = Number(params.get('t') ?? 0);

function Clock({ time }) {
  useAnimationFrame((_, delta) => {
    if (RENDER) return;
    time.set((time.get() + delta / 1000) % DURATION);
  });
  return null;
}

function App() {
  const time = useMotionValue(START);
  if (RENDER) {
    window.__duration = DURATION;
    window.__seek = (t) => time.set(t);
  }
  return (
    <TimeContext.Provider value={time}>
      <Clock time={time} />
      <div className={`stage${RENDER ? ' stage--render' : ''}`}>
        <Intro />
        <Colors />
        <Type />
        <Components />
        <Charts />
        <Numbers />
        <Outro />
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
