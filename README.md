# No Clue‽ archive

A Rook Works–themed, static home for the original comic, *The Reboot*, one-shots, recovered posts, and character material.

## Add located material

1. Drop unsorted files into `content/inbox/`.
2. Move confirmed comic pages into a collection under `content/comics/`.
3. Run `npm run sync` to regenerate `public/comics.json`.
4. Run `npm run dev` and open the printed local address.

Supported image formats are PNG, JPG, JPEG, WebP, GIF, and AVIF. File names become display titles, so `oneshot-01.png` becomes `Oneshot 01`. Put files in reading order by giving them sortable names.

The generated site is static and can later be deployed to GitHub Pages without a database or PHP.
