type Listener = () => void;

let listener: Listener | undefined;

export function registerPaletteOpener(fn: Listener): void {
  listener = fn;
}

export function openCommandPalette(): void {
  listener?.();
}
