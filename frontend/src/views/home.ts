export function renderHome(): HTMLElement {
  const section = document.createElement('section');
  section.className = 'flex flex-col mt-[20%] items-center justify-center h-full text-center relative z-[3] font-[mclaren]';

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