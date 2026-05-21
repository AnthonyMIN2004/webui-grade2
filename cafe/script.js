/* =====================================================
   script.js — all behavior for Cafe OCC
   ctrl+F the section name to jump to it

   1. DARK / LIGHT MODE
   2. HEADER SHADOW ON SCROLL
   3. SCROLL REVEAL
   4. RANDOM RECOMMEND BUTTON
   ===================================================== */


/* =====================
   1. DARK / LIGHT MODE
   toggles class "dark" on body
   saves the choice so it stays the same after refreshzxxx
   ===================== */

const themeBtn = document.getElementById('themeBtn');

// check if user picked dark mode last time and apply it on load
const savedTheme = localStorage.getItem('occ-theme');
if (savedTheme === 'dark') {
  document.body.classList.add('dark');
}

themeBtn.addEventListener('click', function () {
  document.body.classList.toggle('dark');

  // save so it remembers even after USER refresh the page
  const isDark = document.body.classList.contains('dark');
  localStorage.setItem('occ-theme', isDark ? 'dark' : 'light');
});


/* =====================
   2. HEADER SHADOW ON SCROLL
   adds class "scrolled" when user goes past 40px
   CSS applies the shadow when that class is present
   ===================== */

const header = document.getElementById('site-header');

window.addEventListener('scroll', function () {
  if (window.scrollY > 40) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});


/* =====================
   3. SCROLL REVEAL
   watches .reveal and .reveal-children elements
   adds class "visible" when they enter the screen
   CSS fades them in when "visible" is added
   ===================== */

const observer = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target); // stop watching — only animate once
    }
  });
}, {
  threshold: 0.12 // fire when 12% of the element is visible
});

document.querySelectorAll('.reveal, .reveal-children').forEach(function (el) {
  observer.observe(el);
});


/* =====================
   4. RANDOM RECOMMEND BUTTON
   picks a random menu item on click
   wont show the same item twice in a row
   ===================== */

// menu items list — each has a name and description
const menuItems = [
  { name: 'カフェラテ',       desc: '深煎りエスプレッソとスチームミルクの組み合わせ。朝の一杯にぴったりです。' },
  { name: 'フレンチトースト', desc: '卵液にひと晩漬けた厚切りブリオッシュ。外はカリッと、中はふんわり。' },
  { name: 'アイスコーヒー',   desc: '水出し12時間のすっきりとした冷たさ。暑い日の午後にどうぞ。' },
  { name: 'ヨーグルトボウル', desc: '旬のベリーとグラノーラをたっぷりのせた、ヘルシーな朝食メニュー。' },
  { name: 'エスプレッソ',     desc: '濃縮された豆の風味をストレートで味わう、コーヒー本来の一杯。' },
];

const recommendBtn    = document.getElementById('recommendBtn');
const recommendResult = document.getElementById('recommendResult');
const recommendText   = document.getElementById('recommendText');

let lastPickedIndex = -1; // -1 means nothing picked yet

recommendBtn.addEventListener('click', function () {

  // keep picking until we get a different one from last time
  let randomIndex;
  do {
    randomIndex = Math.floor(Math.random() * menuItems.length);
  } while (randomIndex === lastPickedIndex);

  lastPickedIndex = randomIndex;
  const chosen = menuItems[randomIndex];

  // write the picked item into the result box
  recommendText.innerHTML =
    '本日のおすすめは <strong>「' + chosen.name + '」</strong>です。<br>' + chosen.desc;

  recommendResult.classList.add('show');

  
  // spin the icon then reset so it can spin again next click
const icon = recommendBtn.querySelector('i');
icon.style.animation = 'none';
setTimeout(function () {
  icon.style.animation = 'spin 0.4s ease';
}, 10);
setTimeout(function () {
  icon.style.animation = '';
}, 410);
}); 