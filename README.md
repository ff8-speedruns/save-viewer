# Save Viewer

Reads an FF8 PC save (`slotN_saveNN.ff8`) in the browser and shows everything the FF8 memory map
knows about it: summary, characters, GFs, items, cards, Triple Triad rules, and every mapped
savemap field.

- **Search** finds fields by name, value or category.
- **Compare saves** puts two or more saves side by side and highlights what differs from the
  first. With **Changed only**, save, do one thing in-game, save again, and you see exactly which
  fields moved.
- **Savemap bytes** is a hex view of the whole 5,028-byte savemap, marking which bytes the memory
  map doesn't cover yet. Combined with compare, it shows the unmapped bytes an in-game action
  touched.

[Live tool](https://tools.ff8.wiki/save-viewer)

## Data

`src/data/savemap.json` is generated from the FF8-Mining project: the memory map
(`ff8-addresses/addresses.toml`) cut down to the savemap and rebased to savemap offsets (live
address − `0x18FDC58`), plus the `reference/*.json` name lists and a few tables from kernel.bin.
After changing the toml:

```bash
npm run generate-data -- <path to FF8-Mining>
```

A few things the hand-built sections rely on that the toml doesn't say:

- Junctioned GFs: bit n is GF n.
- GF learned abilities: bit n is ability id n.
- Card counts are the low 7 bits.
- Rare card holder `0xF0` is you.
- Weapon ids index kernel.bin's weapon list.

## Development

Vite + React + Mantine, with the shared shell from
[@ff8-speedruns/ui](https://github.com/ff8-speedruns/ff8-ui).

```bash
npm install
npm run dev
npm run build
npm run lint
npm test         # pass init.out or .ff8 paths to src/lib/save.check.js to check real files too
```

Pushing to `main` deploys to `gh-pages`.
