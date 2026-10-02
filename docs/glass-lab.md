# Glass lab

Glass lab is disabled by default. Set `NEXT_PUBLIC_GLASS_LAB=1` and restart the
development server to enable it. Then open **Glass lab** at the lower left. The menu has
separate Contact panel and Yellow buttons tabs. Both yellow buttons always use
the same material and light settings.

Controls update live, including individual light position, color and intensity,
surface curvature, reflection sharpness, pointer response and glass properties.
Settings are saved in this browser's local storage. Reset restores the defaults
for the selected tab. Export JSON downloads both configurations for keeping a
chosen preset or transferring it into `src/components/glass-settings.ts`.

The menu is excluded from production. Remove the flag or set
`NEXT_PUBLIC_GLASS_LAB=0` and restart the development server to disable it again.
Hide until reload temporarily
removes the menu and its launcher while retaining the current settings.
