(() => {
  const headings = Array.from(
    document.querySelectorAll('#content h2, #content h3, #content h4, #content h5, #content h6')
  );
  if (!headings.length) return;

  const toggleSection = (heading, collapse) => {
    const container = heading.parentElement;
    const shouldCollapse = collapse !== undefined ? collapse : heading.dataset.state !== 'collapsed';
    heading.dataset.state = shouldCollapse ? 'collapsed' : 'expanded';
    heading.setAttribute('aria-expanded', shouldCollapse ? 'false' : 'true');

    Array.from(container.children).forEach((child) => {
      if (child !== heading) {
        child.hidden = shouldCollapse;
        child.classList.add('org-section-body');
      }
    });
  };

  // Find the first h3 post (latest post) and its parent "Recent writing" section
  const latestPost = headings.find((h) => h.tagName === 'H3');
  const recentWriting = latestPost?.closest('.outline-2')?.querySelector('h2');

  headings.forEach((heading) => {
    const container = heading.parentElement;
    const hasBody = Array.from(container.children).some((child) => child !== heading);
    if (!hasBody) return;

    heading.classList.add('org-collapsible');
    heading.tabIndex = 0;

    heading.addEventListener('click', (event) => {
      event.preventDefault();
      toggleSection(heading);
    });

    heading.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleSection(heading);
      }
    });

    // Start collapsed, except for "Recent writing" and the latest post.
    const shouldExpand = heading === latestPost || heading === recentWriting;
    toggleSection(heading, !shouldExpand);
  });
})();
