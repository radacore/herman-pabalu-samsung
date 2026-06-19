// Confirm dialog helper. Singleton modal controlled by the global
// `window.confirmDialog()` function. Resolves to true on confirm, false on
// cancel/Escape/backdrop. If `onConfirm` is provided, runs it on confirm
// and shows a loading state until it resolves.

type Variant = 'danger' | 'primary';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: Variant;
  onConfirm?: () => void | Promise<void>;
}

const TRASH_ICON =
  '<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>';

const SPINNER =
  '<svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"></path></svg>';

declare global {
  interface Window {
    confirmDialog: (opts: ConfirmOptions) => Promise<boolean>;
  }
}

export {};

function ensureModal(): {
  root: HTMLElement;
  backdrop: HTMLElement;
  panel: HTMLElement;
  icon: HTMLElement;
  title: HTMLElement;
  message: HTMLElement;
  cancelBtn: HTMLButtonElement;
  actionBtn: HTMLButtonElement;
  actionText: HTMLElement;
  actionSpinner: HTMLElement;
} {
  let root = document.querySelector<HTMLElement>('[data-confirm-root]');
  if (root) {
    return {
      root,
      backdrop: root.querySelector('[data-confirm-backdrop]')!,
      panel: root.querySelector('[data-confirm-panel]')!,
      icon: root.querySelector('[data-confirm-icon]')!,
      title: root.querySelector('[data-confirm-title]')!,
      message: root.querySelector('[data-confirm-message]')!,
      cancelBtn: root.querySelector<HTMLButtonElement>('[data-confirm-cancel]')!,
      actionBtn: root.querySelector<HTMLButtonElement>('[data-confirm-action]')!,
      actionText: root.querySelector('[data-confirm-action-text]')!,
      actionSpinner: root.querySelector('[data-confirm-action-spinner]')!,
    };
  }

  root = document.createElement('div');
  root.setAttribute('data-confirm-root', '');
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.className =
    'hidden fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6';

  root.innerHTML = `
    <div data-confirm-backdrop class="absolute inset-0 bg-samsung-ink/50 backdrop-blur-sm opacity-0 transition-opacity duration-200"></div>
    <div data-confirm-panel class="relative w-full max-w-md bg-white rounded-2xl shadow-cardHover border border-samsung-ink/5 transform scale-95 opacity-0 transition-all duration-200 ease-out">
      <div class="px-6 pt-6">
        <div data-confirm-icon class="w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-red-50 text-red-600">${TRASH_ICON}</div>
        <h3 data-confirm-title class="font-display text-lg font-bold text-samsung-ink leading-tight"></h3>
        <p data-confirm-message class="text-sm text-samsung-ink/70 mt-2 leading-relaxed"></p>
      </div>
      <div class="flex gap-2 px-6 py-4 mt-4 border-t border-samsung-ink/5">
        <button
          type="button"
          data-confirm-cancel
          class="flex-1 px-4 py-2.5 rounded-full text-sm font-semibold bg-samsung-ink/5 text-samsung-ink/70 hover:bg-samsung-ink/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        ></button>
        <button
          type="button"
          data-confirm-action
          class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <span data-confirm-action-text></span>
          <span data-confirm-action-spinner class="hidden">${SPINNER}</span>
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(root);

  return ensureModal();
}

function escapeHtml(message: string): string {
  const div = document.createElement('div');
  div.textContent = message;
  return div.innerHTML;
}

let currentResolve: ((value: boolean) => void) | null = null;
let currentOnConfirm: (() => void | Promise<void>) | null = null;

function setLoading(loading: boolean, actionBtn: HTMLButtonElement, cancelBtn: HTMLButtonElement, actionText: HTMLElement, actionSpinner: HTMLElement) {
  actionBtn.disabled = loading;
  cancelBtn.disabled = loading;
  actionText.classList.toggle('hidden', loading);
  actionSpinner.classList.toggle('hidden', !loading);
  if (loading) {
    cancelBtn.classList.add('!cursor-not-allowed');
  } else {
    cancelBtn.classList.remove('!cursor-not-allowed');
  }
}

function openModal(els: ReturnType<typeof ensureModal>, opts: ConfirmOptions) {
  els.title.textContent = opts.title;
  els.message.textContent = opts.message;
  els.cancelBtn.textContent = opts.cancelText || 'Batal';
  els.actionText.textContent = opts.confirmText || 'Konfirmasi';

  // Icon + button color per variant
  const isDanger = (opts.variant ?? 'danger') === 'danger';
  els.icon.className = isDanger
    ? 'w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-red-50 text-red-600'
    : 'w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-samsung-blue/10 text-samsung-blue';

  els.actionBtn.className = isDanger
    ? 'flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed'
    : 'flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold bg-samsung-blue text-white hover:bg-samsung-darkblue transition-colors active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed';

  // Icon: trash for danger, info for primary
  if (isDanger) {
    els.icon.innerHTML = TRASH_ICON;
  } else {
    els.icon.innerHTML =
      '<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 16v-4M12 8h.01"/><circle cx="12" cy="12" r="10"/></svg>';
  }

  currentOnConfirm = opts.onConfirm || null;
  setLoading(false, els.actionBtn, els.cancelBtn, els.actionText, els.actionSpinner);

  els.root.classList.remove('hidden');
  requestAnimationFrame(() => {
    els.backdrop.classList.replace('opacity-0', 'opacity-100');
    els.panel.classList.replace('scale-95', 'scale-100');
    els.panel.classList.replace('opacity-0', 'opacity-100');
  });

  // Focus action button after open
  setTimeout(() => els.actionBtn.focus(), 50);
}

function closeModal(els: ReturnType<typeof ensureModal>, result: boolean) {
  els.backdrop.classList.replace('opacity-100', 'opacity-0');
  els.panel.classList.replace('scale-100', 'scale-95');
  els.panel.classList.replace('opacity-100', 'opacity-0');
  setTimeout(() => {
    els.root.classList.add('hidden');
    currentResolve?.(result);
    currentResolve = null;
    currentOnConfirm = null;
  }, 200);
}

let initialized = false;

function init() {
  if (initialized) return;
  initialized = true;

  window.confirmDialog = (opts: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      const els = ensureModal();
      currentResolve = resolve;
      openModal(els, opts);
    });
  };

  // Bind once
  const els = ensureModal();

  els.cancelBtn.addEventListener('click', () => {
    if (els.actionBtn.disabled) return;
    closeModal(els, false);
  });

  els.backdrop.addEventListener('click', () => {
    if (els.actionBtn.disabled) return;
    closeModal(els, false);
  });

  document.addEventListener('keydown', (e) => {
    if (els.root.classList.contains('hidden')) return;
    if (e.key === 'Escape') {
      if (els.actionBtn.disabled) return;
      closeModal(els, false);
    }
  });

  els.actionBtn.addEventListener('click', async () => {
    if (!currentOnConfirm) {
      closeModal(els, true);
      return;
    }
    setLoading(true, els.actionBtn, els.cancelBtn, els.actionText, els.actionSpinner);
    try {
      await currentOnConfirm();
      // Caller is responsible for showing toast feedback
      closeModal(els, true);
    } catch (err) {
      setLoading(false, els.actionBtn, els.cancelBtn, els.actionText, els.actionSpinner);
      // Modal stays open so user can retry; caller should toast the error
      throw err;
    }
  });
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}
