# Legacy assets — archived, not part of the site

Nothing in this folder is referenced by the application, and nothing in it is
served in production.

## `previous-photos/`

`1.png` – `11.png` are photographs from the **previous version of this project**,
which was made for a different person.

They were moved here from `public/` on purpose. Vite copies everything inside
`public/` verbatim into `dist/`, so while these files lived there they were:

- adding ~25 MB to every production build, and
- publicly fetchable at `https://<domain>/3.png` even though nothing linked to them.

Outside `public/`, Vite ignores them entirely.

### Rules

- **Do not delete them.** They are kept deliberately.
- **Do not move them back into `public/`.**
- **Do not import or reference them** from any component, content file, stylesheet,
  fallback path, or metadata.

Every image the site actually uses is declared in `src/content/images.js` and lives
in `public/images/`.
