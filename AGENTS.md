# Repository Guidelines

## Project Structure & Module Organization
- `content/` holds all Org sources; `index.org` is the homepage, `posts/` contains articles, and `assets/` stores shared CSS or media.
- `publish.el` configures `org-publish`; treat it as the single source of build settings (paths, sitemap, pre/postamble).
- `public/` is generated output; do not hand-edit files here—regenerate instead.
- Keep new Org pages under `content/` with clear filenames (e.g., `posts/topic-name.org`).

## Build, Test, and Development Commands
Run these from the repo root:
```sh
emacs -Q --batch -l org -l ox-publish -l publish.el -f org-publish-all
```
- Builds the full site into `public/` using the settings in `publish.el`.
```sh
open public/index.html
```
- Quick visual check of the generated site (use any local HTML viewer).

## Coding Style & Naming Conventions
- Org files: wrap lines logically, prefer two-space indentation for nested lists/blocks, and keep headings consistent (`*`, `**`, `***` as needed).
- Use lowercased, hyphenated filenames for new pages and assets.
- Keep front-matter directives (title, subtitle, options) at the top of each Org file; mirror the style used in `content/index.org`.
- Leave HTML/CSS tweaks in `content/assets/` rather than inline HTML unless unavoidable.

## Testing & Verification
- No automated tests; rely on manual verification:
  - After publishing, open key pages from `public/` and spot-check layout, nav links, and code blocks.
  - Ensure new assets are referenced with correct relative paths (`/assets/...`).
  - Run `rg TODO content` to avoid shipping placeholder notes.

## Commit & Pull Request Guidelines
- Follow the existing short, imperative commit style with optional prefixes (`chore:`, `fix:`, `content:`).
- Keep commits scoped (one change per commit) and include generated `public/` updates only when intentional.
- PRs: summarize changes, list touched pages, note any visual differences, and link issues if present. Include before/after screenshots when modifying layout or styles.

## Publishing & Deployment Tips
- Always rebuild before pushing so `public/` matches the Org sources.
- If adjusting `publish.el`, document the change in the PR description and verify both Org-to-HTML output and static asset copying.
