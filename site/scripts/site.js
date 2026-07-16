export function menuView(open) {
  return {
    expanded: String(open),
    label: open ? "Close menu" : "Open menu",
    hidden: !open,
  };
}

export async function copyPrompt({ url, fetchText, writeText }) {
  try {
    const prompt = await fetchText(url);
    if (!prompt?.trim()) return { ok: false };
    await writeText(prompt);
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

function applyMenuState(toggle, menu, open) {
  const view = menuView(open);
  toggle.setAttribute("aria-expanded", view.expanded);
  toggle.setAttribute("aria-label", view.label);
  menu.hidden = view.hidden;
}

export function initMenu(root = document) {
  const toggle = root.querySelector(".menu-toggle");
  const menu = root.querySelector(".mobile-menu");
  if (!toggle || !menu) return () => {};

  const setOpen = (open) => applyMenuState(toggle, menu, open);
  const onToggle = (event) => {
    event.stopPropagation();
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  };
  const onMenuClick = (event) => {
    if (event.target.closest("a")) setOpen(false);
  };
  const onKeyDown = (event) => {
    if (event.key === "Escape") {
      setOpen(false);
      toggle.focus();
    }
  };
  const onPointerDown = (event) => {
    if (!menu.hidden && !menu.contains(event.target) && !toggle.contains(event.target)) {
      setOpen(false);
    }
  };

  setOpen(false);
  toggle.addEventListener("click", onToggle);
  menu.addEventListener("click", onMenuClick);
  root.addEventListener("keydown", onKeyDown);
  root.addEventListener("pointerdown", onPointerDown);

  return () => {
    toggle.removeEventListener("click", onToggle);
    menu.removeEventListener("click", onMenuClick);
    root.removeEventListener("keydown", onKeyDown);
    root.removeEventListener("pointerdown", onPointerDown);
  };
}

export function initCopyPrompt(root = document) {
  const anchor = root.querySelector("[data-copy-prompt]");
  const label = anchor?.querySelector("[data-copy-label]");
  if (!anchor || !label) return () => {};

  const defaultLabel = label.textContent;
  let resetTimer = 0;
  const onClick = async (event) => {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      !navigator.clipboard?.writeText
    ) return;

    event.preventDefault();
    const result = await copyPrompt({
      url: anchor.dataset.copyPrompt,
      fetchText: async (url) => {
        const response = await fetch(url, { cache: "force-cache" });
        if (!response.ok) throw new Error(`Prompt request failed: ${response.status}`);
        return response.text();
      },
      writeText: (text) => navigator.clipboard.writeText(text),
    });

    if (!result.ok) {
      window.location.assign(anchor.href);
      return;
    }

    window.clearTimeout(resetTimer);
    label.textContent = "COPIED";
    anchor.dataset.copyState = "success";
    resetTimer = window.setTimeout(() => {
      label.textContent = defaultLabel;
      delete anchor.dataset.copyState;
    }, 1800);
  };

  anchor.addEventListener("click", onClick);
  return () => {
    window.clearTimeout(resetTimer);
    anchor.removeEventListener("click", onClick);
  };
}

if (typeof document !== "undefined") {
  initMenu(document);
  initCopyPrompt(document);
}
