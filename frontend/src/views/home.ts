// Home page
export function renderHome(): HTMLElement {
  const section = document.createElement('section');
  section.className = 'home-section flex flex-col w-full items-center justify-center text-center z-10 font-[pressstart2p] px-4';

  section.innerHTML = `
    <div class="title mobile-title">
      <span class="first_line"></span>
      <span class="mid_line">
        <span class="fast-flicker">PONG</span>
        GA<span class="flicker">M</span>E
      </span>
      <span class="last_line"></span>
    </div>
    <div class="mobile-title-two-lines">
      <div class="mobile-line-1 fast-flicker">PONG</div>
      <div class="mobile-line-2">GA<span class="flicker">M</span>E</div>
    </div>
  `;
  return section;
}