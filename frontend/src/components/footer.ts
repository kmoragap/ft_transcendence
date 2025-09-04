export function renderFooter(): HTMLElement {
  const footer = document.createElement('footer');
  footer.className = 'flex justify-center mt-auto w-full px-8 py-5 bg-gradient-to-r from-[#1f7474] to-[#031b1b] font-[jura] font-bold text-base text-[#66fcf1] z-10';
  footer.style.backgroundImage = 'linear-gradient(91deg, #1f7474 0%, #031b1b 90%)';
  footer.innerHTML = '&copy; 2025 ft_transcendence';
  return footer;
}