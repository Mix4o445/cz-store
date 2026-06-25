export default function WhatsAppFab() {
  const number = (import.meta.env.VITE_WHATSAPP_NUMBER || '+212600000000').replace(/[^\d]/g, '');
  return (
    <a
      href={`https://wa.me/${number}`}
      target="_blank"
      rel="noreferrer"
      aria-label="WhatsApp"
      className="fixed bottom-24 md:bottom-6 end-4 md:end-6 z-30 inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-ink text-paper text-xs uppercase tracking-wider-1 font-medium hover:bg-primary transition-colors shadow-soft"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" aria-hidden="true">
        <path d="M20.52 3.48A11.93 11.93 0 0 0 12.04 0C5.5 0 .2 5.3.2 11.84c0 2.09.55 4.13 1.6 5.93L0 24l6.39-1.68a11.84 11.84 0 0 0 5.65 1.44h.01c6.55 0 11.85-5.3 11.85-11.84a11.79 11.79 0 0 0-3.38-8.44ZM12.04 21.5h-.01a9.65 9.65 0 0 1-4.92-1.35l-.35-.21-3.79 1 1-3.69-.23-.38a9.66 9.66 0 0 1-1.48-5.13c0-5.34 4.35-9.68 9.69-9.68a9.62 9.62 0 0 1 6.85 2.84 9.6 9.6 0 0 1 2.83 6.85c0 5.34-4.34 9.69-9.59 9.75Zm5.55-7.25c-.3-.15-1.79-.88-2.07-.98-.28-.1-.48-.15-.68.15-.2.3-.78.98-.95 1.18-.18.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.49-.9-.8-1.5-1.78-1.68-2.08-.18-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.07-.15-.68-1.63-.93-2.23-.24-.58-.49-.5-.68-.51l-.58-.01c-.2 0-.53.07-.81.38-.28.3-1.07 1.05-1.07 2.55s1.1 2.96 1.25 3.16c.15.2 2.16 3.3 5.23 4.62.73.31 1.3.5 1.74.64.73.23 1.39.2 1.92.12.59-.09 1.79-.73 2.04-1.43.25-.7.25-1.3.18-1.43-.07-.13-.27-.2-.57-.35Z" />
      </svg>
      WhatsApp
    </a>
  );
}
