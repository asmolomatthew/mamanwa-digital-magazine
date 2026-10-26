const progressBar = document.getElementById('progressBar');
const navLinks = document.getElementById('navLinks');
const menuToggle = document.getElementById('menuToggle');
const sourcesDialog = document.getElementById('sourcesDialog');

function updateProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
}
window.addEventListener('scroll', updateProgress, { passive: true });
window.addEventListener('resize', updateProgress);

menuToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
  menuToggle.textContent = isOpen ? '×' : '☰';
});
navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  navLinks.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open navigation');
  menuToggle.textContent = '☰';
}));

document.getElementById('sourcesButton').addEventListener('click', () => sourcesDialog.showModal());
document.getElementById('closeDialog').addEventListener('click', () => sourcesDialog.close());
sourcesDialog.addEventListener('click', event => {
  if (event.target === sourcesDialog) sourcesDialog.close();
});

/* ===== Magazine additions ===== */

// "In this issue" table of contents, built from the sections already on the page.
(function buildToc() {
  const story = document.getElementById('story');
  if (!story) return;
  const items = [...document.querySelectorAll('main section[id]')]
    .filter(s => s.id !== 'cover' && s.querySelector('.section-index') && s.querySelector('h2'))
    .map(s => {
      const h = s.querySelector('h2').cloneNode(true);
      h.querySelectorAll('br').forEach(b => b.replaceWith(' '));
      const num = s.querySelector('.section-index').textContent.split('/')[0].trim();
      const sub = (s.querySelector('.eyebrow') || {}).textContent || '';
      return `<li><a href="#${s.id}"><span class="toc-n">${num}</span><span class="toc-t">${h.textContent.replace(/\s+/g, ' ').trim()}</span><span class="toc-s">${sub}</span></a></li>`;
    });
  const toc = document.createElement('section');
  toc.className = 'toc';
  toc.id = 'issue';
  toc.setAttribute('aria-label', 'In this issue');
  toc.innerHTML = `<p class="eyebrow">In this issue</p><h2>Seven stories, <em>one question.</em></h2><ol>${items.join('')}</ol>`;
  story.before(toc);
})();

// Highlight the current section in the nav (sections without a link map to the nearest one).
const navMap = { void: 'data', principles: 'solution' };
const navAnchors = [...navLinks.querySelectorAll('a')];
if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = navMap[entry.target.id] || entry.target.id;
      navAnchors.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('main section[id]').forEach(s => sectionObserver.observe(s));
}

// The single motion moment: artwork unveils once as it scrolls into view.
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduceMotion && 'IntersectionObserver' in window) {
  const artObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      artObserver.unobserve(entry.target);
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.section-art, .intro-art').forEach(el => {
    if (el.getBoundingClientRect().top > window.innerHeight * 0.9) {
      el.classList.add('art-reveal');
      artObserver.observe(el);
    }
  });
}

// Share card with QR code, placed in the footer.
(function addShareCard() {
  const footer = document.querySelector('.mag-footer');
  if (!footer) return;
  const url = 'https://mamanwa-digital-magazine-mamanwa-di.vercel.app/';
  const card = document.createElement('div');
  card.className = 'share-card';
  card.innerHTML = `<img src="image/mamanwa-qr.png" alt="QR code that opens this magazine at ${url}" width="160" height="160"><div><p class="eyebrow">Share this issue</p><h3>Scan to read on your phone.</h3><p class="share-url">${url.replace('https://', '')}</p><button type="button" id="copyLink">COPY LINK</button></div>`;
  footer.querySelector('.disclaimer').before(card);
  const btn = card.querySelector('#copyLink');
  btn.addEventListener('click', () => {
    const done = () => { btn.textContent = 'COPIED ✓'; setTimeout(() => { btn.textContent = 'COPY LINK'; }, 2000); };
    if (navigator.clipboard) navigator.clipboard.writeText(url).then(done).catch(() => window.prompt('Copy this link:', url));
    else window.prompt('Copy this link:', url);
  });
})();

// Failsafe: never leave artwork hidden if the observer does not fire.
window.addEventListener('load', () => {
  setTimeout(() => {
    document.querySelectorAll('.art-reveal:not(.in)').forEach(el => el.classList.add('in'));
  }, 2500);
});

updateProgress();
/* ===== Photo map: one place to maintain every image path, alt text, and caption ===== */
const IMG_DIR = 'image/';
const PHOTOS = {
  cover: {
    m: { f: 'mamanwa.cover.jpg', alt: 'A group of women and a seated man in colorful patterned clothing; one person holds a stringed instrument and a woven bag sits in front.', cap: 'People gathered together, one holding a stringed instrument. Place, date, and community to be verified.' },
    b: { f: 'badjao.cover.jpg', alt: 'Dugout boats on clear shallow water near houses built on stilts, with a green island behind.', cap: 'Boats and stilt houses over shallow sea. Place and date to be verified; many Badjao/Sama Dilaut now live on land.' }
  },
  s1: {
    m: { f: 'mamanwa.section1.jpg', alt: 'Children and adults standing outdoors beside a bamboo fence on a green, farmed hillside.', cap: 'Children and adults outdoors in a farming area. Place and date to be verified. Identifiable children: confirm consent.' },
    b: { f: 'badjao.section1.jpg', alt: 'A wooden boat with people aboard and a thatched platform on stilts in calm turquoise water.', cap: 'A boat and a thatched platform on open water. Place and date to be verified.' }
  },
  s2: {
    m: { f: 'mamanwa.section2.webp', alt: 'An elderly man weaves strips of plant material on the ground while children sit around him and watch.', cap: 'An elder weaves while children watch: learning by observation. Material, place, and community to be verified.' },
    b: { f: 'badjao.section2.jpg', alt: 'Two performers in colorful costumes dance in front of a crowd of onlookers beside a thatched house.', cap: 'Two performers dancing before onlookers. The research documents Igal in Tawi-Tawi; this photo\u2019s dance and place are unconfirmed.' }
  },
  s3: {
    m: { f: 'mamanwa.section6.jpg', alt: 'Aerial view of terraced rice fields, palm trees, and a small building beside a water tank.', cap: 'Farmland and settlement seen from above. The team found no open map layer showing Mamanwa settlements. Place to be verified.' },
    b: { f: 'badjao.section6.jpg', alt: 'Black-and-white view of thatched stilt houses standing in dark water under a cloudy sky.', cap: 'Stilt houses over water. No public map layer for sea-use areas of the Sama Dilaut was found. Place and date to be verified.' }
  },
  s4: {
    m: { f: 'mamanwa.section4.jpg', alt: 'A crowd of smiling adults and children gathered outdoors between houses; a man holds a toddler.', cap: 'People gathered outdoors, many smiling. The event and place are to be verified. Identifiable children: confirm consent.' },
    b: { f: 'badjao.section4.jpg', alt: 'Smiling children in bright shirts hold sticks near bamboo posts at the water\u2019s edge.', cap: 'Children playing with sticks at the shore. Place and date to be verified. Identifiable children: confirm consent.' }
  },
  s5: {
    m: { f: 'mamanwa.section3.jpg', alt: 'People weave round baskets under a large covered court, with houses and trees behind.', cap: 'Community members making woven baskets under a covered court. The research documents handicraft training in Alegria, but this photo\u2019s event is unconfirmed.' },
    b: { f: 'badjao.section3.jpg', alt: 'A crowded shoreline of small boats, blue tarps, and people close to the water.', cap: 'A crowded coastal settlement of boats and tarps. Place and date to be verified.' }
  },
  s6: {
    m: { f: 'mamanwa.section7.jpg', alt: 'An elderly person in a beaded headdress, large ear ornaments, and embroidered clothing strikes a set of hanging gongs.', cap: 'An elder striking gongs in beaded and embroidered clothing. Community identity and event must be verified before use.' },
    b: { f: 'badjao.section7.jpg', alt: 'Two people in yellow and white clothes and green head wraps perform paired movements on a boat deck with water and hills behind.', cap: 'Two performers in coordinated movements on a boat deck. Context to be verified.' }
  },
  s7: {
    m: { f: 'mamanwa.section5.jpg', alt: 'A boy in a camouflage shirt holds a small fish and a clear plastic container beside a large rock in muddy water.', cap: 'A boy holding a fish and a container beside a rock in muddy water. Place and date to be verified. Confirm consent.' },
    b: { f: 'badjao.section5.jpg', alt: 'A stylized, textured image of a boy crouching on the bow of a boat against a blue, patterned background.', cap: 'A stylized, edited image, not a documentary photograph. Its origin and license must be verified, or it should be replaced.' }
  }
};
const LABEL = { m: 'Mamanwa', b: 'Badjao / Sama Dilaut' };
function photoFigure(key, side, eager) {
  const p = PHOTOS[key][side];
  return `<figure class="ph-fig ph-${side}"><div class="ph" role="button" tabindex="0" aria-label="View larger: ${LABEL[side]} photo"><img src="${IMG_DIR + p.f}" alt="${p.alt}"${eager ? '' : ' loading="lazy"'} decoding="async"></div><figcaption><b>${LABEL[side]}</b>${p.cap}<span class="cr">Photo credit: to be verified</span></figcaption></figure>`;
}
(function renderPhotos() {
  const cover = document.getElementById('coverArt');
  if (cover) cover.innerHTML = photoFigure('cover', 'm', true) + photoFigure('cover', 'b', true);
  document.querySelectorAll('[data-duo]').forEach(el => {
    const k = el.dataset.duo;
    if (PHOTOS[k]) el.innerHTML = photoFigure(k, 'm') + photoFigure(k, 'b');
  });
})();

/* ===== Interactions: photo viewer, data filter, access explorer, reveal, back-to-top ===== */
(function interactions() {
  // Photo viewer (click or Enter on any photo)
  const lb = document.createElement('dialog');
  lb.id = 'lightbox';
  lb.setAttribute('aria-label', 'Photo viewer');
  lb.innerHTML = '<button class="lb-x" aria-label="Close photo">×</button><img alt=""><p></p>';
  document.body.append(lb);
  const openLb = ph => {
    const img = ph.querySelector('img'), cap = ph.parentElement.querySelector('figcaption');
    const big = lb.querySelector('img');
    big.src = img.src; big.alt = img.alt;
    lb.querySelector('p').innerHTML = cap ? cap.innerHTML : '';
    lb.showModal();
  };
  document.addEventListener('click', e => {
    const ph = e.target.closest('.ph[role="button"]');
    if (ph) return openLb(ph);
    if (e.target === lb || e.target.closest('.lb-x')) lb.close();
  });
  document.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.ph[role="button"]')) { e.preventDefault(); openLb(e.target); }
  });

  // Data Gap: show one community's figures or both
  const wraps = { m: document.querySelector('.tbl-m'), b: document.querySelector('.tbl-b') };
  Object.keys(wraps).forEach(k => { if (wraps[k]) wraps[k] = wraps[k].closest('.table-wrap'); });
  document.querySelectorAll('.seg button').forEach(btn => btn.addEventListener('click', () => {
    const f = btn.dataset.f;
    document.querySelectorAll('.seg button').forEach(b => { const on = b === btn; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); });
    Object.keys(wraps).forEach(k => { if (wraps[k]) wraps[k].hidden = !(f === 'all' || f === k); });
  }));

  // IS proposal: explore the four conceptual access levels
  const panel = document.querySelector('.access-panel');
  if (panel) {
    const items = [...panel.querySelectorAll('.access-levels > div')];
    const detail = document.createElement('div');
    detail.className = 'access-detail';
    detail.setAttribute('aria-live', 'polite');
    panel.append(detail);
    const pick = el => {
      items.forEach(i => { i.classList.toggle('active', i === el); i.setAttribute('aria-pressed', String(i === el)); });
      detail.innerHTML = `<strong>${el.dataset.name}</strong><span><b>Who may access:</b> ${el.dataset.who}</span><span><b>Example:</b> ${el.dataset.ex}</span><em>Conceptual category only. The community decides the real rules.</em>`;
    };
    items.forEach(i => {
      i.setAttribute('role', 'button'); i.tabIndex = 0;
      i.addEventListener('click', () => pick(i));
      i.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(i); } });
    });
    if (items[0]) pick(items[0]);
  }

  // Gentle reveal for content below the fold
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12 });
    document.querySelectorAll('.profile,.heritage-card,.audit-grid article,.void-list article,.feature-grid article,.flow-node,.principle-row,.table-wrap,.sdg-row > div,.action-list li,.team-reflections > div,.fact-strip article').forEach(el => {
      if (el.getBoundingClientRect().top > window.innerHeight * 0.9) { el.classList.add('rv'); io.observe(el); }
    });
  }

  // Back to top
  const top = document.createElement('a');
  top.className = 'to-top'; top.href = '#cover'; top.setAttribute('aria-label', 'Back to top'); top.textContent = '↑';
  document.body.append(top);
  window.addEventListener('scroll', () => top.classList.toggle('show', window.scrollY > 900), { passive: true });
})();

/* ===== Related videos: click to load a YouTube player. Edit this list to add or change videos. ===== */
const VIDEOS = {
  s1: [
    { id: 'UdMO3jJ4sso', s: 'm', t: 'Mamanwa Tribe', n: 'Mamanwa families settling in Leyte after leaving Surigao (per the video description).' },
    { id: '-9xpXpKKNdM', s: 'b', t: 'Sama Dilaut or Badjao Tribe in Tawi-Tawi', n: 'An introduction to the Sama Dilaut in Tawi-Tawi.' }
  ],
  s2: [
    { id: 'nnvgZJnZPQk', s: 'm', t: 'Mamanua Cultural Dance and Song', n: 'A cultural show by a Mamanwa group in Surigao City, filmed 2019 (per the description).' },
    { id: 'n9flg1d1v-s', s: 'b', t: 'A Badjau (Sama Dilaut) Traditional Wedding in Tawi-Tawi | Palunsul TV Special', n: 'A traditional wedding in Tawi-Tawi.' }
  ],
  s3: [
    { id: 'n1hJPMh78mY', s: 'b', t: 'Sama Badjao Halaw From South Ubian, Tawi Tawi: Narratives (2000\u20132018)', n: 'A university presentation by Prof. Astridin A. Bernado (MSU-TCTO): one example of how a community is documented in research.' }
  ],
  s5: [
    { id: 'twp6lABlTM8', s: 'x', t: 'D4I Tribal Data Repository: Protecting Tribal Data & Why It Matters', n: 'An Indigenous-led data repository in the US. Context only; not Philippine.' }
  ],
  s6: [
    { id: 'kc3zMcBm3IY', s: 'x', t: 'Webinar on the CARE Principles for Indigenous Data Governance (Dr. Sven Ouzman)', n: 'Listed on YouTube as \u201cDSWB\u201d; verify title and host.' }
  ]
};
(function renderVideos() {
  const tag = { m: 'Mamanwa', b: 'Badjao / Sama Dilaut', x: 'Context' };
  document.querySelectorAll('[data-vids]').forEach(box => {
    const list = VIDEOS[box.dataset.vids] || [];
    box.innerHTML = list.map(v => `<figure class="vid vid-${v.s}"><button type="button" class="vid-play" data-id="${v.id}" data-title="${v.t.replace(/"/g, '&quot;')}" aria-label="Play video: ${v.t.replace(/"/g, '&quot;')}"><img src="https://i.ytimg.com/vi/${v.id}/hqdefault.jpg" alt="" loading="lazy" onerror="this.remove()"><span class="vid-btn" aria-hidden="true">\u25B6</span></button><figcaption><b>${tag[v.s]} \u00B7 video</b>${v.t}<span class="vid-note">${v.n} Not made by the team; check the channel before relying on it. <a href="https://www.youtube.com/watch?v=${v.id}" target="_blank" rel="noreferrer">Open on YouTube \u2197</a></span></figcaption></figure>`).join('');
  });
  document.addEventListener('click', e => {
    const b = e.target.closest('.vid-play');
    if (!b) return;
    const f = document.createElement('iframe');
    f.src = `https://www.youtube-nocookie.com/embed/${b.dataset.id}?autoplay=1&rel=0`;
    f.title = b.dataset.title;
    f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share';
    f.allowFullscreen = true;
    f.referrerPolicy = 'strict-origin-when-cross-origin';
    b.replaceWith(f);
  });
})();
