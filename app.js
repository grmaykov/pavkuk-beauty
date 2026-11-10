const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('#navigation');
function setMenu(open) {
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  nav.classList.toggle('open', open);
  document.body.classList.toggle('menu-open', open);
}
menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
window.matchMedia('(min-width: 901px)').addEventListener('change', e => { if(e.matches) setMenu(false); });
const labels = {all: 'Все направления', brows: 'Брови', lips: 'Губы', lashline: 'Межресничка', removal: 'Удаление'};
const photoCards = [...document.querySelectorAll('#photo-panel .portfolio-card')];
const olgaPhotoCards = [...document.querySelectorAll('#olga-works .portfolio-card')];
const moreButton = document.querySelector('#photo-panel .gallery-more-button');
const emptyGallery = document.querySelector('.gallery-empty');
let galleryFilter = 'all';
let visibleLimit = 6;
function matchingCards() {
  return photoCards.filter(card => galleryFilter === 'all' || card.dataset.category === galleryFilter);
}
function renderGallery() {
  const matching = matchingCards();
  document.querySelector('.portfolio-gallery').classList.toggle('category-view', ['brows', 'lips', 'lashline'].includes(galleryFilter));
  photoCards.forEach(card => card.hidden = !matching.includes(card) || matching.indexOf(card) >= visibleLimit);
  emptyGallery.hidden = matching.length > 0;
  moreButton.hidden = matching.length <= visibleLimit;
  moreButton.textContent = `Показать ещё ${Math.min(6, matching.length - visibleLimit)} фото ↓`;
  document.querySelector('#gallery-status').textContent = matching.length
    ? `Показано ${Math.min(visibleLimit, matching.length)} из ${matching.length} фотографий. Нажми на снимок, чтобы рассмотреть его крупнее.`
    : `${labels[galleryFilter]} — фотографии скоро появятся.`;
}
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
  galleryFilter = button.dataset.filter;
  visibleLimit = 6;
  document.querySelectorAll('[data-filter]').forEach(b => {
    b.classList.toggle('active', b === button);
    b.setAttribute('aria-pressed', String(b === button));
  });
  renderGallery();
}));
moreButton.addEventListener('click', () => {
  const firstNew = matchingCards()[visibleLimit];
  visibleLimit += 6;
  renderGallery();
  firstNew?.querySelector('a').focus({preventScroll: true});
});
renderGallery();

const viewer = document.querySelector('.photo-viewer');
const viewerMedia = document.querySelector('.viewer-media');
const viewerImage = document.querySelector('.viewer-image');
let currentPhoto = 0;
let viewerCards = photoCards;
let viewerTrigger;
function showPhoto(index) {
  const matching = viewerCards;
  currentPhoto = (index + matching.length) % matching.length;
  const card = matching[currentPhoto];
  const link = card.querySelector('[data-photo]');
  const img = link.querySelector('img');
  viewerImage.src = link.getAttribute('href');
  viewerImage.alt = img.alt;
  viewerMedia.style.setProperty('--photo-ratio', link.dataset.ratio);
  viewerMedia.classList.toggle('rotate-90', link.dataset.rotate === '90');
  document.querySelector('#viewer-title').textContent = card.querySelector('.photo-title').textContent;
  document.querySelector('#viewer-counter').textContent = `${currentPhoto + 1} / ${matching.length}`;
  document.querySelector('#viewer-detail').textContent = card.querySelector('figcaption small').textContent;
}
document.querySelectorAll('[data-photo]').forEach(link => link.addEventListener('click', e => {
  if(e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
  e.preventDefault();
  viewerTrigger = link;
  const card = link.closest('.portfolio-card');
  viewerCards = card.dataset.master === 'olga' ? olgaPhotoCards : matchingCards();
  showPhoto(viewerCards.indexOf(card));
  viewer.showModal();
  document.body.classList.add('viewer-open');
}));
document.querySelector('.viewer-close').addEventListener('click', () => viewer.close());
document.querySelector('.viewer-prev').addEventListener('click', () => showPhoto(currentPhoto - 1));
document.querySelector('.viewer-next').addEventListener('click', () => showPhoto(currentPhoto + 1));
viewer.addEventListener('keydown', e => {
  if(e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
    e.preventDefault();
    showPhoto(currentPhoto + (e.key === 'ArrowRight' ? 1 : -1));
  }
});
viewer.addEventListener('click', e => { if(e.target === viewer) viewer.close(); });
viewer.addEventListener('close', () => {
  document.body.classList.remove('viewer-open');
  viewerTrigger?.focus({preventScroll: true});
});
const mobileBook = document.querySelector('.mobile-book');
if (mobileBook && 'IntersectionObserver' in window) {
  new IntersectionObserver(entries => mobileBook.classList.toggle('hidden', entries[0].isIntersecting), {threshold: .1}).observe(document.querySelector('#contacts'));
}

// Tabs retain each collection's own browsing state and support keyboard navigation.
const workTabs = [...document.querySelectorAll('.work-tabs [role="tab"]')];
function selectWorkTab(tab) {
  workTabs.forEach(item => {
    const selected = item === tab;
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
    document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
  });
}
workTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectWorkTab(tab));
  tab.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const target = event.key === 'Home' ? 0 : event.key === 'End' ? workTabs.length - 1
      : (index + (event.key === 'ArrowRight' ? 1 : -1) + workTabs.length) % workTabs.length;
    selectWorkTab(workTabs[target]);
    workTabs[target].focus();
  });
});
const videoCards = [...document.querySelectorAll('.video-card')];
const videoMore = document.querySelector('.video-more-button');
let videoLimit = 6;
videoMore.addEventListener('click', () => {
  const firstNew = videoCards[videoLimit];
  videoLimit += 6;
  videoCards.forEach((card, index) => card.hidden = index >= videoLimit);
  videoMore.hidden = videoLimit >= videoCards.length;
  videoMore.textContent = `Показать ещё ${Math.min(6, videoCards.length - videoLimit)} видео ↓`;
  document.querySelector('#video-gallery-status').textContent = `Показано ${Math.min(videoLimit, videoCards.length)} из ${videoCards.length} видео.`;
  firstNew?.querySelector('button').focus({preventScroll: true});
});

const videoViewer = document.querySelector('.video-viewer');
const player = document.querySelector('.portfolio-player');
const videoStatus = document.querySelector('#video-status');
const retryVideo = document.querySelector('.video-retry');
const videos = window.portfolioVideos;
let currentVideo = 0;
let videoTrigger;
let hlsPlayer;
let hlsLoader;
let videoGeneration = 0;
let usingOriginal = false;
let currentVideoFailed = false;

function stopVideo() {
  videoGeneration += 1;
  player.pause();
  if (hlsPlayer) { hlsPlayer.destroy(); hlsPlayer = null; }
  player.removeAttribute('src');
  player.load();
}
function loadHlsLibrary() {
  if (window.Hls) return Promise.resolve(window.Hls);
  if (!hlsLoader) hlsLoader = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'assets/vendor/hls.min.js';
    script.onload = () => resolve(window.Hls);
    script.onerror = () => { script.remove(); hlsLoader = null; reject(new Error('Player unavailable')); };
    document.head.appendChild(script);
  });
  return hlsLoader;
}
function preferOriginal(video) {
  if (!video.hevc) return true;
  // HDR originals are reserved for HDR displays; SDR compatibility copies are tone-mapped once.
  if (video.hdr && !window.matchMedia('(dynamic-range: high)').matches) return false;
  return !!player.canPlayType('video/mp4; codecs="hvc1.1.6.L153.B0"');
}
function videoError() {
  if (!videoViewer.open || currentVideoFailed) return;
  const video = videos[currentVideo];
  if (usingOriginal && video.original !== video.compatible) {
    startVideo(currentVideo, false);
    return;
  }
  currentVideoFailed = true;
  videoStatus.textContent = 'Не удалось загрузить видео. Проверь соединение и попробуй ещё раз.';
  retryVideo.hidden = false;
}
function requestPlayback() {
  const result = player.play();
  result?.catch(error => {
    if (error.name === 'NotAllowedError') videoStatus.textContent = 'Нажми ▶ в плеере, чтобы начать просмотр.';
    else if (error.name !== 'AbortError') videoError();
  });
}
async function startVideo(index, originalPreference) {
  stopVideo();
  currentVideo = (index + videos.length) % videos.length;
  const video = videos[currentVideo];
  const generation = videoGeneration;
  currentVideoFailed = false;
  usingOriginal = originalPreference ?? preferOriginal(video);
  const source = usingOriginal ? video.original : video.compatible;
  player.poster = video.poster;
  player.setAttribute('aria-label', video.title);
  document.querySelector('#video-viewer-title').textContent = video.title;
  document.querySelector('#video-counter').textContent = `${currentVideo + 1} / ${videos.length}`;
  videoStatus.textContent = 'Загружаем видео…';
  retryVideo.hidden = true;
  if (player.canPlayType('application/vnd.apple.mpegurl')) {
    player.src = source;
    requestPlayback();
    return;
  }
  try {
    const Hls = await loadHlsLibrary();
    if (generation !== videoGeneration || !videoViewer.open) return;
    if (!Hls.isSupported()) throw new Error('Streaming unavailable');
    hlsPlayer = new Hls({maxBufferLength: 8, maxMaxBufferLength: 16, backBufferLength: 4});
    hlsPlayer.on(Hls.Events.ERROR, (_event, data) => {
      if (generation === videoGeneration && data.fatal) videoError();
    });
    hlsPlayer.on(Hls.Events.MANIFEST_PARSED, () => {
      if (generation === videoGeneration) requestPlayback();
    });
    hlsPlayer.loadSource(source);
    hlsPlayer.attachMedia(player);
  } catch {
    if (generation === videoGeneration) videoError();
  }
}
player.addEventListener('error', videoError);
player.addEventListener('playing', () => { videoStatus.textContent = ''; });
player.addEventListener('waiting', () => { if (!currentVideoFailed) videoStatus.textContent = 'Загружаем видео…'; });
player.addEventListener('ended', () => { videoStatus.textContent = ''; });
document.querySelectorAll('[data-video]').forEach(button => button.addEventListener('click', () => {
  videoTrigger = button;
  videoViewer.showModal();
  document.body.classList.add('viewer-open');
  startVideo(Number(button.dataset.video));
}));
document.querySelector('.video-close').addEventListener('click', () => videoViewer.close());
document.querySelector('.video-prev').addEventListener('click', () => startVideo(currentVideo - 1));
document.querySelector('.video-next').addEventListener('click', () => startVideo(currentVideo + 1));
retryVideo.addEventListener('click', () => startVideo(currentVideo, false));
videoViewer.addEventListener('click', event => { if (event.target === videoViewer) videoViewer.close(); });
videoViewer.addEventListener('close', () => {
  stopVideo();
  document.body.classList.remove('viewer-open');
  videoTrigger?.focus({preventScroll: true});
});

const videoToggle = document.querySelector('.video-toggle');
const videoSound = document.querySelector('.video-sound');
videoToggle.addEventListener('click', () => { if (player.paused) requestPlayback(); else player.pause(); });
player.addEventListener('play', () => { videoToggle.textContent = 'Пауза'; });
player.addEventListener('pause', () => { videoToggle.textContent = 'Смотреть'; });
player.addEventListener('ended', () => { videoToggle.textContent = 'Ещё раз'; });
videoSound.addEventListener('click', () => { player.muted = !player.muted; });
player.addEventListener('volumechange', () => { videoSound.textContent = player.muted ? 'Включить звук' : 'Выключить звук'; });
document.querySelector('.video-fullscreen').addEventListener('click', async () => {
  try {
    if (player.requestFullscreen) await player.requestFullscreen();
    else if (player.webkitEnterFullscreen) player.webkitEnterFullscreen();
    else videoStatus.textContent = 'Полноэкранный режим доступен через меню видеоплеера.';
  } catch { videoStatus.textContent = 'Полноэкранный режим доступен через меню видеоплеера.'; }
});
// Keep the hero animation quiet and stop work while it cannot be seen.
const heroArt = document.querySelector('.hero-art');
const heroReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let heroInView = true;
function syncHeroMotion() {
  heroArt.dataset.motionPaused = String(!heroInView || document.hidden || heroReducedMotion.matches);
}
heroReducedMotion.addEventListener('change', syncHeroMotion);
document.addEventListener('visibilitychange', syncHeroMotion);
if ('IntersectionObserver' in window) {
  new IntersectionObserver(entries => {
    heroInView = entries[0].isIntersecting;
    syncHeroMotion();
  }, {threshold: 0}).observe(heroArt);
}
syncHeroMotion();

// Olga's work area is kept separate from Alina's portfolio.
const olgaWorksToggle = document.querySelector('.colleague-works-toggle');
const olgaWorksPanel = document.querySelector('#olga-works');
olgaWorksToggle.addEventListener('click', () => {
  const expanded = olgaWorksToggle.getAttribute('aria-expanded') !== 'true';
  olgaWorksToggle.setAttribute('aria-expanded', String(expanded));
  olgaWorksPanel.hidden = !expanded;
});

let olgaVisibleLimit = 6;
const olgaMoreButton = document.querySelector('.olga-more-button');
function renderOlgaGallery() {
  olgaPhotoCards.forEach((card, index) => { card.hidden = index >= olgaVisibleLimit; });
  const remaining = Math.max(0, olgaPhotoCards.length - olgaVisibleLimit);
  olgaMoreButton.hidden = remaining === 0;
  olgaMoreButton.textContent = `Показать ещё ${Math.min(6, remaining)} фото ↓`;
  document.querySelector('#olga-gallery-status').textContent = `Показано ${Math.min(olgaVisibleLimit, olgaPhotoCards.length)} из ${olgaPhotoCards.length} фотографий.`;
}
olgaMoreButton.addEventListener('click', () => {
  const firstNew = olgaPhotoCards[olgaVisibleLimit];
  olgaVisibleLimit += 6;
  renderOlgaGallery();
  firstNew?.querySelector('a').focus({preventScroll: true});
});
renderOlgaGallery();
