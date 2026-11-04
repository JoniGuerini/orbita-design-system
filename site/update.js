/**
 * Aviso de versão nova: o build publica version.json com a impressão digital do deploy
 * (scripts/build-site.mjs). A aba guarda a impressão com que abriu e confere de tempos em
 * tempos e quando a pessoa volta para ela; se mudou, chama onUpdate uma vez e para.
 *
 *   watchForUpdates({ onUpdate: (info) => mostrarAviso(info) });
 *
 * Sem version.json (servidor local, npm run dev), não faz nada.
 */
const URL_ = 'version.json';
const INTERVAL = 5 * 60 * 1000; // 5 min com a aba visível

async function fetchVersion() {
  const res = await fetch(`${URL_}?t=${Date.now()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(String(res.status));
  return res.json();
}

export function watchForUpdates({ onUpdate, interval = INTERVAL } = {}) {
  let baseline = null;
  let timer = null;
  let stopped = false;

  const stop = () => {
    stopped = true;
    clearInterval(timer);
    document.removeEventListener('visibilitychange', onVisible);
    window.removeEventListener('online', check);
  };

  async function check() {
    if (stopped || document.visibilityState !== 'visible') return;
    try {
      const info = await fetchVersion();
      if (stopped || !baseline || info.build === baseline.build) return;
      stop();
      onUpdate?.(info);
    } catch {} // sem rede ou sem arquivo: tenta de novo na próxima vez
  }

  function onVisible() {
    if (document.visibilityState === 'visible') check();
  }

  fetchVersion()
    .then((info) => {
      if (stopped) return;
      baseline = info;
      timer = setInterval(check, interval);
      document.addEventListener('visibilitychange', onVisible);
      window.addEventListener('online', check);
    })
    .catch(() => stop()); // sem version.json: servidor local, nada a vigiar

  return stop;
}
