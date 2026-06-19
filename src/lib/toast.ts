// Toast notification helper. Attaches a singleton container to <body>
// on first use. Toast slides in from the right, auto-dismisses, can be
// dismissed early via the close button.

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ShowOptions {
  type: ToastType;
  message: string;
  duration?: number;
}

const ICONS: Record<ToastType, string> = {
  success: '<path d="M20 6L9 17l-5-5"/>',
  error: '<path d="M18 6L6 18M6 6l12 12"/>',
  info: '<path d="M12 16v-4M12 8h.01"/><circle cx="12" cy="12" r="10"/>',
  warning: '<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01"/>',
};

const ACCENT: Record<ToastType, string> = {
  success: 'text-emerald-500',
  error: 'text-red-500',
  info: 'text-samsung-blue',
  warning: 'text-amber-500',
};

function ensureContainer(): HTMLElement {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-atomic', 'false');
    container.className =
      'fixed bottom-4 right-4 z-[80] flex flex-col-reverse gap-2 pointer-events-none';
    document.body.appendChild(container);
  }
  return container;
}

function iconSvg(type: ToastType): string {
  return `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[type]}</svg>`;
}

function closeBtnSvg(): string {
  return `<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>`;
}

function escape(message: string): string {
  const div = document.createElement('div');
  div.textContent = message;
  return div.innerHTML;
}

function show({ type, message, duration = 4000 }: ShowOptions): void {
  if (typeof document === 'undefined') return;
  const container = ensureContainer();

  const toast = document.createElement('div');
  const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  toast.id = id;
  toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
  toast.className = [
    'pointer-events-auto',
    'flex items-start gap-3',
    'min-w-[280px] max-w-sm',
    'px-4 py-3',
    'bg-white rounded-2xl shadow-cardHover',
    'border border-samsung-ink/5',
    'transform transition-all duration-200 ease-out',
    'translate-x-full opacity-0',
  ].join(' ');

  toast.innerHTML = `
    <div class="flex-shrink-0 ${ACCENT[type]}">${iconSvg(type)}</div>
    <p class="flex-1 text-sm font-medium text-samsung-ink leading-snug py-0.5">${escape(message)}</p>
    <button
      type="button"
      data-toast-dismiss
      class="flex-shrink-0 -mr-1 -mt-1 p-1 rounded-lg text-samsung-ink/40 hover:text-samsung-ink hover:bg-samsung-ink/5 transition-colors"
      aria-label="Tutup notifikasi"
    >${closeBtnSvg()}</button>
  `;

  container.prepend(toast);

  requestAnimationFrame(() => {
    toast.classList.remove('translate-x-full', 'opacity-0');
  });

  let timer: ReturnType<typeof setTimeout> | null = null;

  const dismiss = () => {
    if (timer) clearTimeout(timer);
    toast.classList.add('translate-x-full', 'opacity-0');
    setTimeout(() => toast.remove(), 200);
  };

  toast.querySelector('[data-toast-dismiss]')?.addEventListener('click', dismiss);

  // Pause auto-dismiss on hover
  toast.addEventListener('mouseenter', () => {
    if (timer) clearTimeout(timer);
  });
  toast.addEventListener('mouseleave', () => {
    timer = setTimeout(dismiss, 1500);
  });

  timer = setTimeout(dismiss, duration);
}

export const toast = {
  success: (message: string, duration?: number) =>
    show({ type: 'success', message, duration }),
  error: (message: string, duration?: number) =>
    show({ type: 'error', message, duration: duration ?? 6000 }),
  info: (message: string, duration?: number) =>
    show({ type: 'info', message, duration }),
  warning: (message: string, duration?: number) =>
    show({ type: 'warning', message, duration }),
};
