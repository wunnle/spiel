// Shared by the server layout (inline <head> script) and lib/theme.ts (the switch).

/** Where the chosen theme is kept; unset means "follow the system". */
export const THEME_KEY = "spiel26:theme";

/** Runs in <head> before anything renders: no flash of the wrong theme. Kept tiny and self-contained. */
export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");var d=t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d)}catch(e){}})()`;
