Create a new blog post placeholder.

Arguments: $ARGUMENTS (should be a short hyphenated slug for the post filename, e.g. "my-new-post")

Steps:
1. If no argument is provided, ask the user for a post slug (hyphenated lowercase filename without extension).
2. Create the file `content/$ARGUMENTS.org` with this template, replacing the title with a human-readable version of the slug (capitalize words, replace hyphens with spaces):

```
#+title: [Title derived from slug]
#+options: toc:nil num:nil

TODO: Write post content here.
```

3. Add an include entry to `content/index.org` under the "Recent writing" heading, as the FIRST post entry (right after the `* Recent writing` line), using today's date:

```
** [Title] (YYYY-MM-DD)
#+include: "$ARGUMENTS.org" :lines "4-"
```

4. Tell the user the file has been created and remind them to replace the TODO placeholder with actual content.
