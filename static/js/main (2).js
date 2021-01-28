const loader = document.querySelector('.loader');
const main = document.querySelector('.main');
const swipe = document.querySelector('.tagline');
const body= document.querySelector('body');
function init() {
  setTimeout(() => {
    loader.style.opacity = 0;
    loader.style.display = 'none';
    swipe.style.opacity = 0;
    swipe.style.display = 'none';
    body.style.backgroundImage = 'none';
    main.style.display = 'block';
    setTimeout(() => (main.style.opacity = 1), 50);
  }, 5000);
}

init();
