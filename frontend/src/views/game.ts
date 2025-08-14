export function renderGame(): HTMLElement {
  const section = document.createElement('section');
  section.className = 'flex flex-col w-full h-full absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 items-center justify-center text-center z-[3] font-[mclaren]';

  section.innerHTML = `
    <!--img src="/assets/img/pong.png" alt="Game Image" class="w-[500px] h-[300px] mb-[20px]"-->
	<canvas id = "board" width = "400" height = "300"></canvas>
		<br>
		<textarea id = "p1score" name = "p1score" rows = "1" cols = "2">0</textarea>:<textarea id = "p2score" name = "p2score" rows = "1" cols = "2">0</textarea>
  `;
  return section;
}