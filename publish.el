(require 'ox-publish)

(let* ((root (file-name-directory (or load-file-name buffer-file-name)))
       (org-root (expand-file-name "content" root))
       (site-root (expand-file-name "public" root))
       (timestamp-dir (expand-file-name ".org-timestamps/" root)))
  (make-directory timestamp-dir t)
  (setq org-publish-timestamp-directory timestamp-dir)

  (setq org-html-preamble t
        org-html-postamble t
        org-html-preamble-format
        '(("en" "<div id=\"org-directives-block\"><pre id=\"org-directives\">#+title: %t\n#+subtitle: %s\n#+options: toc:nil num:nil</pre></div>"))
        org-html-postamble-format
        '(("en" "<div id=\"org-modeline\">U:----  %t   All   (1,0)     (Org ind counsel SP company FlyC- ivy)</div>")))

  (setq org-publish-project-alist
        `(("org-site"
           :base-directory ,org-root
           :base-extension "org"
           :publishing-directory ,site-root
           :recursive t
           :publishing-function org-html-publish-to-html
           :with-author nil
           :with-creator nil
           :section-numbers nil
           :time-stamp-file nil
           :auto-sitemap t
           :sitemap-title "Index"
           :html-head "<link rel=\"icon\" type=\"image/svg+xml\" href=\"assets/favicon.svg\" />\n<link rel=\"stylesheet\" href=\"assets/style.css\" /><script src=\"assets/fold.js\" defer></script>")
          ("org-static"
           :base-directory ,org-root
           :base-extension "css\\|js\\|png\\|jpg\\|gif\\|svg\\|pdf\\|ico"
           :publishing-directory ,site-root
           :recursive t
           :publishing-function org-publish-attachment)
          ("cname"
           :base-directory ,root
           :include ("CNAME")
           :publishing-directory ,site-root
           :recursive nil
           :publishing-function org-publish-attachment)
          ("site" :components ("org-site" "org-static" "cname")))))
