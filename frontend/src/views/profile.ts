export function renderHome(): HTMLElement {
  const section = document.createElement('section');
  section.className = 'flex flex-col w-full h-full absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 items-center justify-center text-center z-10 font-[pressstart2p]';

  section.innerHTML = `
    <div class="title">
      <span class="first_line"></span>
      <span class="mid_line">
        <span class="fast-flicker">PONG</span>
        GA<span class="flicker">M</span>E
      </span>
      <span class="last_line"></span>
    </div>
  `;
  return section;
}