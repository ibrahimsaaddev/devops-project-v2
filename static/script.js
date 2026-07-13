// subtle reveal-on-scroll for section blocks
document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('main > section');

  sections.forEach(s => {
    s.style.opacity = 0;
    s.style.transform = 'translateY(14px)';
    s.style.transition = 'opacity .5s ease, transform .5s ease';
  });

  const reveal = (entries, obs) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.style.opacity = 1;
        entry.target.style.transform = 'translateY(0)';
        obs.unobserve(entry.target);
      }
    });
  };

  const observer = new IntersectionObserver(reveal, { threshold: 0.12 });
  sections.forEach(s => observer.observe(s));

  // highlight active nav link based on scroll position
  const links = document.querySelectorAll('.nav__links a');
  const targets = Array.from(links).map(a => document.querySelector(a.getAttribute('href')));

  const setActive = () => {
    let current = 0;
    targets.forEach((t, i) => {
      if(t && t.getBoundingClientRect().top <= 120) current = i;
    });
    links.forEach((a, i) => a.style.color = i === current ? 'var(--accent)' : '');
  };
  document.addEventListener('scroll', setActive, { passive: true });
  setActive();
});
