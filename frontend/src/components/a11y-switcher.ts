import { toggleHighContrast, getA11yState, setTextScale } from '../utils/a11y';
import { updateText, t } from '../i18n';

export function renderA11yControls(): HTMLElement {
  const wrap = document.createElement('div');
  wrap.className = 'relative ml-3';

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = [
    'inline-flex items-center gap-2',
    'ml-[15px] px-[5px] py-[2px] mt-[6px] bg-[#0a2b2b] text-[#66fcf1] border border-[#66fcf1] rounded-[5px]',
    'focus-visible:ring-2 focus-visible:ring-[#66fcf1]'
  ].join(' ');
  trigger.setAttribute('aria-haspopup', 'menu');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-controls', 'a11y-menu');
  trigger.innerHTML = `
    <span class="whitespace-nowrap">A+/-</span>
    <svg width="14" height="14" viewBox="0 0 20 20" aria-hidden="true" class="opacity-80">
      <path d="M5 7l5 6 5-6" fill="none" bg-[#0a2b2b] stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `;

  // ── Dropdown panel ───────────────────────────────────────────────────────────
  const panel = document.createElement('div');
  panel.id = 'a11y-menu';
  panel.setAttribute('role', 'menu');
  panel.className = [
    'absolute w-[180px] right-[0] mt-2 w-64 z-[1000]',
    'rounded-[5px] border border-[rgba(102,252,241,0.35)]',
    'shadow-[0_10px_30px_rgba(0,0,0,0.6)] bg-[#0a2b2b]',
    'p-2 hidden'
  ].join(' ');

  const label = (txtKey: string) => {
    const el = document.createElement('div');
    el.className = 'px-2 pt-1 pb-2 text-xs uppercase tracking-wide bg-[#0a2b2b] z-[1000] text-[#9fe7e3]';
    el.setAttribute('data-i18n', txtKey);
    el.textContent = t(txtKey);
    return el;
  };

  const mkRadioRow = (labelKey: string, scale: number) => {
    const row = document.createElement('button');
    row.type = 'button';
    row.setAttribute('role', 'menuitemradio');
    row.className = 'w-full flex items-center justify-between px-3 py-2 rounded bg-[#0a2b2b] text-[#66fcf1] z-[1000] focus-visible:ring-2 focus-visible:ring-[#66fcf1]';
    row.innerHTML = `
      <span data-i18n="${labelKey}">${t(labelKey)}</span>
      <span class="opacity-90 text-sm bg-[#0a2b2b]">${Math.round(scale * 100)}%</span>
    `;
    row.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      setTextScale(scale);
      syncUI();
      close();
      trigger.focus();
    });
    return row;
  };

  const hcRow = document.createElement('button');
  hcRow.type = 'button';
  hcRow.setAttribute('role', 'menuitemcheckbox');
  hcRow.className = 'w-full flex items-center justify-between px-[3px] py-2 rounded bg-[#0a2b2b] text-[#66fcf1] focus-visible:ring-2 focus-visible:ring-[#66fcf1]';
  hcRow.innerHTML = `
    <span data-i18n="high_contrast">${t('high_contrast')}</span>
    <span class="opacity-90 text-sm" data-state>Off</span>
  `;
  hcRow.addEventListener('mousedown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleHighContrast();
    syncUI();
    // keep menu open (like a select with checkboxes), or close if you prefer:
    // close(); trigger.focus();
  });

  panel.append(
    label('text_size'),
    mkRadioRow('small', 0.95),
    mkRadioRow('default', 1.00),
    mkRadioRow('large', 1.15),
    mkRadioRow('x_large', 1.30),
    mkRadioRow('xx_large', 1.50),
    document.createElement('hr'),
    label('theme'),
    hcRow
  );

  updateText();

  let open = false;
  const openPanel = () => {
    if (open) return;
    open = true;
    panel.classList.remove('hidden');
    trigger.setAttribute('aria-expanded', 'true');
    const first = panel.querySelector<HTMLElement>('[role="menuitemradio"],[role="menuitemcheckbox"]');
    first?.focus();
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onKeyNav);
  };
  const close = () => {
    if (!open) return;
    open = false;
    panel.classList.add('hidden');
    trigger.setAttribute('aria-expanded', 'false');
    document.removeEventListener('mousedown', onClickOutside);
    document.removeEventListener('keydown', onKeyNav);
  };
  const onClickOutside = (e: MouseEvent) => { 
    const target = e.target as Node;
    if (!wrap.contains(target)) {
      close();
    }
  };
  const focusables = () => Array.from(panel.querySelectorAll<HTMLElement>('[role="menuitemradio"],[role="menuitemcheckbox"]'));
  const onKeyNav = (e: KeyboardEvent) => {
    const items = focusables();
    const current = document.activeElement as HTMLElement;
    const i = items.indexOf(current);
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); (items[i + 1] || items[0]).focus(); break;
      case 'ArrowUp':   e.preventDefault(); (items[i - 1] || items[items.length - 1]).focus(); break;
      case 'Home':      e.preventDefault(); items[0].focus(); break;
      case 'End':       e.preventDefault(); items[items.length - 1].focus(); break;
      case 'Escape':    e.preventDefault(); close(); trigger.focus(); break;
      case 'Tab':       close(); break;
    }
  };
  trigger.addEventListener('click', () => (open ? close() : openPanel()));
  trigger.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPanel(); }
  });

  function syncUI() {
    const st = getA11yState();
    focusables().forEach(el => {
      if (el.getAttribute('role') === 'menuitemradio') {
        const pct = el.querySelector('span:last-child')?.textContent?.replace('%','') || '100';
        const isActive = Math.round(st.scale * 100) === Number(pct);
        el.setAttribute('aria-checked', String(isActive));
        el.classList.toggle('bg-[#0a2b2b]', isActive);
      }
    });
    const stateEl = hcRow.querySelector('[data-state]')!;
    stateEl.textContent = st.hc ? 'On' : 'Off';
    hcRow.setAttribute('aria-checked', String(st.hc));
  }
  syncUI();

  wrap.append(trigger, panel);
  updateText();
  return wrap;
}