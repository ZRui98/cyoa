import { writable, derived } from 'svelte/store';
import { BROWSER } from 'esm-env';

interface ThemeSettings {
  darkMode: boolean;
}

interface ReaderSettings {
  typeAnimation: boolean;
  typeSpeed: number;
}

interface EditorSettings {
  autoFocus: boolean;
  autoCollapse: boolean;
}

interface Settings {
  theme: ThemeSettings;
  reader: ReaderSettings;
  editor: EditorSettings;
}
const defaultSettings: Settings = {
  theme: {
    darkMode: false,
  },
  reader: {
    typeAnimation: true,
    typeSpeed: 50,
  },
  editor: {
    autoFocus: true,
    autoCollapse: false,
  },
};

let localStorageSettings = BROWSER && localStorage.getItem('settings');
const storedSettings = localStorageSettings ? JSON.parse(localStorageSettings) : defaultSettings;
export const settings = writable<Settings>(storedSettings);
settings.subscribe((value) => {
  if (!BROWSER) return;
  localStorage?.setItem('settings', JSON.stringify(value));
});

const createThemeStore = () => {
  const { subscribe } = derived(settings, (val) => val.theme);

  function set(themeVal: ThemeSettings) {
    settings.update((val) => {
      val.theme = themeVal;
      return val;
    });
  }

  return {
    subscribe,
    set,
  };
};

export const theme = createThemeStore();
