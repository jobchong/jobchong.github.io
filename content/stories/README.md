# The Briar Patch Library

A fill-in-the-blanks storybook for small children learning to spell on a computer. It's plain HTML and JavaScript with no build step: open `index.html` in Safari or Chrome.

Each page has a picture and a blank word, and the child fills it in by typing. Only the right letter goes in. A wrong key gets a soft "boop" and the letter floats away. Nothing ever has to be deleted or corrected. (There is no reading voice for now; see *Voice* below.)

## The two shelves

| Shelf | For | How the blanks work |
|---|---|---|
| **The Little Shelf** | about 3 | Every letter of the word is printed faintly. The matching key glows on the on-screen typewriter and a pointing hand shows it big. The child is learning letter shapes and where the keys are. |
| **The Big Shelf** | about 5 | Only empty letter slots, with the picture as the clue. After two wrong keys the next letter fades in and its key lights up. The same happens if they go quiet for about ten seconds, or press the down arrow. |

Finishing a book puts a gold star on its cover. Stars are kept in the browser's local storage.

## Keys

All of these are on the Karabiner allowlist:

| Key | Does |
|---|---|
| letters | fill in the blank |
| right arrow or return | turn the page (only once the page is filled in) |
| left arrow | go back a page (from the title page, back to the shelf) |
| up arrow or space | read the page again (only when the voice is on) |
| down arrow | a hint: show the next letter and light its key |

Each shelf scrolls sideways. Use the arrow keys to choose a book and Return to open it, or scroll over a row and click a cover. Shortcuts with cmd, ctrl or option are ignored by the app, so grown-ups can still use them.

## The stories

| Book | Shelf | Source |
|---|---|---|
| Old MacDonald Had a Farm | Little | Traditional song |
| Hey Diddle Diddle | Little | *The Real Mother Goose* (1916), [Project Gutenberg #10607](https://www.gutenberg.org/ebooks/10607) |
| Where Is Little Rabbit? | Little | New: a hide-and-seek book |
| Twinkle, Twinkle, Little Star | Little | Jane Taylor, "The Star", from *Rhymes for the Nursery* (1806). The first two of its five verses, with the first sung again at the end. |
| Hickory, Dickory, Dock | Little | *The Real Mother Goose* (1916), [Project Gutenberg #10607](https://www.gutenberg.org/ebooks/10607) |
| One Red Bug | Little | New: a counting book (one bug, two frogs, three ducks, four pigs, five mice, and a cow) |
| The Princess and the Pea | Little | Andersen, "The Real Princess", from *Andersen's Fairy Tales*, [Project Gutenberg #1597](https://www.gutenberg.org/ebooks/1597). That translation has three peas (Andersen's Danish has one), and so does this book. |
| The Little Red Hen | Big | Retold from Florence White Williams' 1918 version, [Project Gutenberg #18735](https://www.gutenberg.org/ebooks/18735) |
| Brer Rabbit and the Briar Patch | Big | Retold from the African American folk tale ([Project Gutenberg #2306](https://www.gutenberg.org/ebooks/2306)) |
| The Owl and the Pussy-Cat | Big | Edward Lear, *Nonsense Songs* (1871), [Project Gutenberg #13647](https://www.gutenberg.org/ebooks/13647). The poem is printed exactly as Lear wrote it. |
| Pip and the Word Tree | Big | New: every word Pip picks comes true |
| The Three Little Pigs | Big | Retold from Joseph Jacobs' *English Fairy Tales* (1890), [Project Gutenberg #7439](https://www.gutenberg.org/ebooks/7439) |
| The Three Billy Goats Gruff | Big | Retold from George Webbe Dasent's translation in *Popular Tales from the Norse* (1859), [Project Gutenberg #8933](https://www.gutenberg.org/ebooks/8933) |
| The Tortoise and the Hare | Big | Retold from *The Aesop for Children* (1919), [Project Gutenberg #19994](https://www.gutenberg.org/ebooks/19994) |
| The Frog Prince | Big | Retold from "The Frog-King, or Iron Henry" in the Grimms' *Household Tales*, tr. Margaret Hunt (1884), [Project Gutenberg #5314](https://www.gutenberg.org/ebooks/5314) |
| Briar Rose | Big | Retold from "Briar-Rose" (Sleeping Beauty) in the same Hunt translation, [Project Gutenberg #5314](https://www.gutenberg.org/ebooks/5314) |
| Frozen: Snow in the Castle | Little | The childhood snow scene from Disney’s *Frozen* (2013), retold for early spellers |
| Sleeping Beauty: The Forest Dance | Big | Aurora and Phillip’s forest meeting from Disney’s *Sleeping Beauty* (1959), retold for early spellers |
| Cinderella and the Glass Slipper | Little | The flight from the ball in Disney’s *Cinderella* (1950) |
| Rapunzel and the Floating Lights | Little | The lantern festival in Disney’s *Tangled* (2010) |
| The Little Mermaid to the Rescue | Little | Ariel’s rescue of Eric in Disney’s *The Little Mermaid* (1989) |
| Beauty and the Beast | Big | The library surprise in Disney’s *Beauty and the Beast* (1991) |
| Aladdin and the Magic Carpet | Big | Jasmine and Aladdin’s flight in Disney’s *Aladdin* (1992) |

Notes on the choices:

- **Brer Rabbit.** The trickster tales come from African American storytelling. The version on Gutenberg is Joel Chandler Harris's 1880 book, which frames them in minstrel-style dialect told by a plantation character, Uncle Remus. This book follows Harris's plot through two of his chapters, "The Wonderful Tar-Baby Story" and "How Mr. Rabbit Was Too Sharp for Mr. Fox", including all four of Brer Fox's threats (roast, hang, drown and skin). It is told in plain modern words, because dialect spellings would teach the wrong spellings, and without the Uncle Remus frame. The Tar-Baby is drawn as a lump of tar in a hat, with no face.
- **The Three Little Pigs and the Billy Goats Gruff** keep their old endings. The wolf eats the first two pigs, and the third boils him and eats him for supper. The big billy goat crushes the Troll "to bits, body and bones" and tosses him into the river. The pigs' tale leaves out Jacobs' middle part (the turnips, the apples and the fair) to keep it short.
- **Enid Blyton, Maurice Sendak and The Phantom Tollbooth** are still under copyright, so they shaped the look, not the words. *Pip and the Word Tree* is a new story in the Tollbooth spirit, where words are things you can pick.
- **The princess books** keep the Grimms' own turns: the princess throws the frog against the wall (there is no kiss), Faithful Henry's iron bands crack, and in Briar Rose the princes caught in the thorns "died a miserable death".
- **Every Big Shelf blank is something you can see in the picture**, so a child can guess it before any hint: thought and speech bubbles show what a character is thinking or talking about (the fox's rope, the pig's chin, the goat's bones), and marks like Zzz, speed lines and a bang show actions. Blanks that no picture can show (did, not, will, are, too, all, off) were moved to a word in the same sentence that can be drawn.
- The blank words are mostly three-letter words that sound out letter by letter (cat, pig, hen, pot, sun, bed, hop, mud), plus a few very common words (not, will, did, are). Those are the words five-year-olds usually learn first.

## Adding or changing a story

Everything is in `stories.js`, and the comment at the top explains the format. A page looks like this:

```js
{ text: '"Not I," said the [cat].', image: 'illustrations/hen/03.webp' }
```

Square brackets mark the blank. Store each book's illustrations under `illustrations/<book-id>/`. Set `after.image` when finishing a word reveals a new picture. An `after` with only text keeps the page illustration. To jump straight to a page while editing, open `index.html#book=hen&page=3` (add `&solve` to see it filled in). The SVG sprites are still available in `index.html#gallery`.

To rename the shelves (to the children's names, say), edit `SHELVES` at the top of `stories.js`.

## Voice

Reading aloud is off, because the browser's built-in voices sound robotic. A natural narrator would mean recording clips ahead of time (with a good speech model, or your own voice) and having the app play them; nothing for that exists yet.

The old built-in-voice narration is still there for testing: add `?speech=on` to the address (and optionally `&voice=Daniel&rate=0.85`).

## Locking it down (Karabiner)

The Karabiner rule *In TextEdit, Safari and Chrome, allow only letters, numbers, arrow keys, space, return, and backspace* covers this app in either browser. Everything else is swallowed whenever one of those three apps is in front: cmd and ctrl shortcuts, Escape, tab, punctuation and shift.

```json
"bundle_identifiers": ["^com\\.apple\\.TextEdit$", "^com\\.apple\\.Safari$", "^com\\.google\\.Chrome$"]
```

Open the book with **View → Enter Full Screen** before you walk away. With Escape and cmd blocked, the keyboard can't leave full screen or close the tab. A mouse or trackpad can still reach the menu bar, though.

**For grown-ups:** the rule also applies when *you* use Safari or Chrome, so you can't type a URL, use shortcuts or type punctuation. Turn it off in Karabiner-Elements → Complex Modifications by removing or disabling the rule, and add it back when the children sit down. Another way is to keep the rule in a separate "Kids" profile and switch profiles from the Karabiner menu-bar icon (switch with the mouse, since the keyboard is locked).
