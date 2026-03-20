Build and publish the org-mode site.

Steps:
1. Run `rg TODO content/ --glob '*.org'` to check for any TODO placeholders in org files. If any are found, warn the user and ask whether to proceed.
2. Run the Emacs org-publish build command from the repo root:
   ```
   emacs -Q --batch -l org -l ox-publish -l publish.el -f org-publish-all
   ```
3. If the build succeeds, tell the user the site has been built to `public/` and suggest they verify with `open public/index.html`.
4. If the build fails, show the error output and suggest possible fixes.
