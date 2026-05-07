/* =====================================================
   script.js — All the JavaScript for Cafe OCC
   =====================================================
   FILE SECTIONS:
     1. Dark / Light Mode Toggle
     2. Header Shadow on Scroll
     3. Scroll Reveal Animation
     4. Random Recommend Button
   ===================================================== */


/* =====================================================
   1. DARK / LIGHT MODE TOGGLE
   =====================================================
   How it works:
   - Find the "テーマ変更" button by its id
   - When clicked, add or remove class "dark" on <body>
   - CSS in style.css changes colors when body has "dark"
   - Save the choice in localStorage so it sticks after refresh
===================================================== */

// document.getElementById finds an HTML element by its id attribute
const themeBtn = document.getElementById('themeBtn');

// localStorage = small storage in the browser that survives page refresh
// Check if the user previously chose dark mode
const savedTheme = localStorage.getItem('occ-theme');

// If they chose dark last time, apply it right away on page load
if (savedTheme === 'dark') {
  document.body.classList.add('dark');
}

// Listen for a click on the theme toggle button
themeBtn.addEventListener('click', function () {

  // classList.toggle adds "dark" if it's missing, removes it if it's there
  document.body.classList.toggle('dark');

  // Check the current state and save it
  const isDark = document.body.classList.contains('dark');
  localStorage.setItem('occ-theme', isDark ? 'dark' : 'light');

});


/* =====================================================
   2. HEADER SHADOW ON SCROLL
   =====================================================
   How it works:
   - Listen for the scroll event on the window
   - If user scrolled more than 40px, add class "scrolled"
   - CSS in style.css adds a shadow when "scrolled" is present
===================================================== */

// Get the header element by its id
const header = document.getElementById('site-header');

// window.addEventListener listens for an event on the whole page
// 'scroll' fires every time the user scrolls
window.addEventListener('scroll', function () {

  // window.scrollY = how many pixels the user has scrolled from the top
  if (window.scrollY > 40) {
    header.classList.add('scrolled');     // show the shadow
  } else {
    header.classList.remove('scrolled'); // remove it when back at top
  }

});


/* =====================================================
   3. SCROLL REVEAL ANIMATION
   =====================================================
   How it works:
   - Find all elements with class "reveal" or "reveal-children"
   - Use IntersectionObserver (a browser tool) to watch them
   - When an element enters the visible screen area, add "visible"
   - CSS in style.css fades it in when "visible" is added
===================================================== */

// IntersectionObserver fires a function when an element enters/exits the screen
const observer = new IntersectionObserver(function (entries) {

  // entries = list of all watched elements that changed visibility
  entries.forEach(function (entry) {

    // entry.isIntersecting = true when the element is visible on screen
    if (entry.isIntersecting) {

      entry.target.classList.add('visible'); // trigger the CSS fade-in animation
      observer.unobserve(entry.target);       // stop watching — only animate once

    }
  });

}, {
  threshold: 0.12 // trigger when at least 12% of the element is visible
});

// Tell the observer to watch all elements with "reveal" or "reveal-children"
document.querySelectorAll('.reveal, .reveal-children').forEach(function (el) {
  observer.observe(el);
});


/* =====================================================
   4. RANDOM RECOMMEND BUTTON
   =====================================================
   How it works:
   - We have an array (list) of menu items
   - When "おすすめを見る" is clicked:
       1. Pick a random item (not the same as last time)
       2. Write the name + description into the result box
       3. Show the result box (it's hidden by default in CSS)
       4. Spin the button icon as a fun visual effect
===================================================== */

// Array = a list of items in JavaScript
// Each item is an object with two properties: name and desc
const menuItems = [
  { name: 'カフェラテ',       desc: '深煎りエスプレッソとスチームミルクの組み合わせ。朝の一杯にぴったりです。' },
  { name: 'フレンチトースト', desc: '卵液にひと晩漬けた厚切りブリオッシュ。外はカリッと、中はふんわり。' },
  { name: 'アイスコーヒー',   desc: '水出し12時間のすっきりとした冷たさ。暑い日の午後にどうぞ。' },
  { name: 'ヨーグルトボウル', desc: '旬のベリーとグラノーラをたっぷりのせた、ヘルシーな朝食メニュー。' },
  { name: 'エスプレッソ',     desc: '濃縮された豆の風味をストレートで味わう、コーヒー本来の一杯。' },
];

// Get the three HTML elements we need to interact with
const recommendBtn    = document.getElementById('recommendBtn');    // the button
const recommendResult = document.getElementById('recommendResult'); // the result box
const recommendText   = document.getElementById('recommendText');   // the paragraph inside

// Remember the last picked index so we don't show the same item twice in a row
// -1 means "nothing was picked yet"
let lastPickedIndex = -1;

// Listen for a click on the recommend button
recommendBtn.addEventListener('click', function () {

  // Pick a random number between 0 and (array length - 1)
  // Keep trying until it's different from the last one
  let randomIndex;
  do {
    // Math.random() = random decimal between 0 and 1 (e.g. 0.73)
    // Multiply by array length, then Math.floor() rounds down to a whole number
    // e.g. 0.73 * 5 = 3.65 → Math.floor → 3
    randomIndex = Math.floor(Math.random() * menuItems.length);
  } while (randomIndex === lastPickedIndex); // repeat if same as last time

  // Save this pick for the next click
  lastPickedIndex = randomIndex;

  // Get the chosen item from the array using its index
  const chosen = menuItems[randomIndex];

  // Write the recommendation into the result paragraph
  // innerHTML lets us include HTML tags like <strong> in the string
  recommendText.innerHTML =
    '本日のおすすめは <strong>「' + chosen.name + '」</strong>です。<br>' + chosen.desc;

  // Show the result box by adding class "show"
  // CSS rule: .recommend-result.show { display: block; }
  recommendResult.classList.add('show');

  // --- Fun icon spin effect ---
  // Find the SVG icon inside the button
  const icon = recommendBtn.querySelector('svg');

  // Apply the spin animation (defined in style.css as @keyframes spin)
  icon.style.animation = 'spin 0.4s ease';

  // Remove the animation after 0.4s so it can spin again on the next click
  setTimeout(function () {
    icon.style.animation = '';
  }, 400); // 400 milliseconds = 0.4 seconds

});