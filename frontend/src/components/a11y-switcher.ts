import { toggleHighContrast, getA11yState, setTextScale } from '../utils/a11y';
import { updateText, t } from '../i18n';

export function renderA11yControls(): HTMLElement {
  const wrap = document.createElement('div');
  wrap.className = 'relative ml-3';

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = [
    'inline-flex items-center gap-2',
    'ml-4 px-1 py-0 mt-1.5 bg-[#0a2b2b] text-[#66fcf1] border border-[#66fcf1] rounded-sm',
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

  const panel = document.createElement('div');
  panel.id = 'a11y-menu';
  panel.setAttribute('role', 'menu');
  panel.className = [
          'absolute w-45 right-0 mt-2 w-64 z-50',
          'rounded-sm border-0',
          'shadow-2xl bg-[#0a2b2b]',
    'py-0.5 hidden'
  ].join(' ');

  const label = (txtKey: string) => {
    const el = document.createElement('div');
    el.className = 'px-0.5 py-0.5 text-xs uppercase tracking-wide bg-[#0a2b2b] z-50 text-[#9fe7e3]';
    el.setAttribute('data-i18n', txtKey);
    el.textContent = t(txtKey);
    return el;
  };

  const mkRadioRow = (labelKey: string, scale: number) => {
    const row = document.createElement('button');
    row.type = 'button';
    row.setAttribute('role', 'menuitemradio');
    row.className = 'w-full flex items-center justify-between px-1 py-1 rounded bg-[#0a2b2b] text-[#66fcf1] z-50 border-0 focus-visible:ring-2 focus-visible:ring-[#66fcf1]';
    row.innerHTML = `
      <span data-i18n="${labelKey}">${t(labelKey)}</span>
      <span class="opacity-90 text-sm hover:bg-[#66fcf1]/15">${Math.round(scale * 100)}%</span>
    `;
    
    const applyScale = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      setTextScale(scale);
      syncUI();
      close();
      trigger.focus();
    };
    
    row.addEventListener('mousedown', applyScale);
    row.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        applyScale(e);
      }
    });
    return row;
  };

  const hcRow = document.createElement('button');
  hcRow.type = 'button';
  hcRow.setAttribute('role', 'menuitemcheckbox');
  hcRow.className = 'w-full flex items-center justify-between px-1 py-0.5 border-0 rounded bg-[#0a2b2b] hover:bg-[#66fcf1]/15 text-[#66fcf1] focus-visible:ring-2 focus-visible:ring-[#66fcf1]';
  hcRow.innerHTML = `
    <span data-i18n="high_contrast">${t('high_contrast')}</span>
    <span class="opacity-90 text-sm hover:bg-[#66fcf1]/15" data-state>Off</span>
  `;
  
  const toggleContrast = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    toggleHighContrast();
    syncUI();
  };
  
  hcRow.addEventListener('mousedown', toggleContrast);
  hcRow.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      toggleContrast(e);
    }
  });

  panel.append(
    label('text_size'),
    mkRadioRow('small', 0.95),
    mkRadioRow('default', 1.00),
    mkRadioRow('large', 1.15),
    mkRadioRow('x_large', 1.30),
    mkRadioRow('xx_large', 1.50),
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