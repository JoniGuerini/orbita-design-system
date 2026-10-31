/**
 * Navegação "nesta página" das páginas de documentação.
 * <nav class="doc-nav"><button class="doc-nav__link" data-target="paletas">Paletas</button>…</nav>
 * Rola até a seção e marca a seção visível (aria-current).
 */
export function mountDocNav(root) {
  const nav = root.querySelector('.doc-nav');
  if (!nav) return () => {};
  const scroller = document.getElementById('main-scroll');
  const links = [...nav.querySelectorAll('[data-target]')];
  const sections = links.map((l) => root.querySelector(`#${l.dataset.target}`)).filter(Boolean);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const setActive = (id) => {
    links.forEach((l) => {
      if (l.dataset.target === id) l.setAttribute('aria-current', 'true');
      else l.removeAttribute('aria-current');
    });
  };

  links.forEach((link) =>
    link.addEventListener('click', () => {
      root.querySelector(`#${link.dataset.target}`)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
      setActive(link.dataset.target);
    }),
  );

  const visible = new Set();
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => (e.isIntersecting ? visible.add(e.target.id) : visible.delete(e.target.id)));
      const first = sections.find((s) => visible.has(s.id));
      if (first) setActive(first.id);
    },
    { root: scroller, rootMargin: '-140px 0px -55% 0px' },
  );
  sections.forEach((s) => observer.observe(s));
  setActive(sections[0]?.id);

  // no fim da página, a última seção pode não chegar ao topo: marca ela mesmo assim
  const onScroll = () => {
    if (scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 4) setActive(sections.at(-1)?.id);
  };
  scroller.addEventListener('scroll', onScroll, { passive: true });

  return () => {
    observer.disconnect();
    scroller.removeEventListener('scroll', onScroll);
  };
}
