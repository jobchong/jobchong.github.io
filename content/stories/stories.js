/* stories.js: the books on the shelves.
 *
 * HOW TO WRITE A PAGE
 *   text   The words on the page. Put a word in [square brackets] to make it a
 *          blank the child types. Use \n for a new line.
 *   image  A local illustration path, relative to index.html.
 *   art    For a sprite-based picture, a list of [sprite, x, y, size, options].
 *          The picture is 300 wide and 360 tall; y is where the sprite's feet are.
 *          Options: flip, rot (degrees), noShadow, plus a few per sprite
 *          (cat: hat/sleep/sad, rabbit: jacket/sleep/laugh/hare, bed: rabbit/pip/ears,
 *          star: face/sleep, house: kind ('straw', 'sticks', 'brick')/down/smoke,
 *          wolf: blow/ouch, troll: roar/wet, pot: lid/fire, goat: fat/happy, clock: one/bong, ...).
 *   bg     The background: day, farm, night, indoor, sea, nightsea, nightbeach, wood,
 *          garden, hill, dusk, pond, river.
 *   after  Optional { text, image } or { text, art, bg }, shown once every blank is filled.
 *
 * HOW THE TWO SHELVES DIFFER
 *   little  Every letter is shown faintly and the matching key glows. The child
 *           just finds the key. (Learning letter names and where keys live.)
 *   big     Only empty letter slots. The picture and the spoken word are the clue.
 *           If they get stuck, the next letter fades in and its key lights up.
 *
 * Rename the shelves to the children's names if you like. The labels are read aloud.
 */
window.SHELVES = [
  { id: 'little', label: 'The Little Shelf', icon: 'mouse' },
  { id: 'big', label: 'The Big Shelf', icon: 'owl' }
];

window.BOOKS = [
  /* ================= THE LITTLE SHELF (about age 3) ================= */
  {
    id: 'macdonald', shelf: 'little', cloth: '#7b2d26',
    title: 'Old MacDonald Had a Farm',
    byline: 'A farmyard song',
    source: 'A traditional folk song.',
    cover: { bg: 'farm', image: 'illustrations/macdonald/cover.webp' },
    pages: [
      { bg: 'farm', text: 'Old MacDonald had a farm,\n[E]-[I]-[E]-[I]-[O]!', image: 'illustrations/macdonald/01.webp' },
      {
        bg: 'farm', text: 'And on that farm he had a [cow],\nE-I-E-I-O!', image: 'illustrations/macdonald/02.webp',
        after: { text: 'With a moo-moo here,\nand a moo-moo there!' }
      },
      {
        bg: 'farm', text: 'And on that farm he had a [pig],\nE-I-E-I-O!', image: 'illustrations/macdonald/03.webp',
        after: { text: 'With an oink-oink here,\nand an oink-oink there!' }
      },
      {
        bg: 'farm', text: 'And on that farm he had a [duck],\nE-I-E-I-O!', image: 'illustrations/macdonald/04.webp',
        after: { text: 'With a quack-quack here,\nand a quack-quack there!' }
      },
      {
        bg: 'farm', text: 'And on that farm he had a [hen],\nE-I-E-I-O!', image: 'illustrations/macdonald/05.webp',
        after: { text: 'With a cluck-cluck here,\nand a cluck-cluck there!' }
      },
      {
        bg: 'farm', text: 'Old MacDonald had a farm,\n[E]-[I]-[E]-[I]-[O]!',
        image: 'illustrations/macdonald/06.webp'
      }
    ]
  },
  {
    id: 'diddle', shelf: 'little', cloth: '#23395b',
    title: 'Hey Diddle Diddle',
    byline: 'An old nursery rhyme',
    source: 'From The Real Mother Goose (1916), Project Gutenberg eBook #10607.',
    cover: { bg: 'night', image: 'illustrations/diddle/cow.webp' },
    pages: [
      { bg: 'night', text: 'Hey, diddle, diddle!\nThe [cat] and the fiddle,', image: 'illustrations/diddle/cat.webp' },
      { bg: 'night', text: 'The [cow] jumped over the [moon];', image: 'illustrations/diddle/cow.webp' },
      { bg: 'night', text: 'The little [dog] laughed\nTo see such sport,', image: 'illustrations/diddle/dog.webp' },
      { bg: 'night', text: 'And the [dish] ran away\nwith the [spoon].', image: 'illustrations/diddle/dish.webp' }
    ],
    end: { bg: 'night', image: 'illustrations/diddle/moon.webp' }
  },
  {
    id: 'rabbit', shelf: 'little', cloth: '#3f5a36',
    title: 'Where Is Little Rabbit?',
    byline: 'A hide-and-seek story',
    source: 'A new story for this library.',
    cover: { bg: 'indoor', image: 'illustrations/rabbit/cover.webp' },
    pages: [
      {
        bg: 'indoor', text: 'Little Rabbit is hiding.\nIs Little Rabbit in the [box]?', image: 'illustrations/rabbit/01.webp',
        after: { text: 'No! It is a frog.\nRibbit!', image: 'illustrations/rabbit/01-reveal.webp' }
      },
      {
        bg: 'indoor', text: 'Is Little Rabbit in the [hat]?', image: 'illustrations/rabbit/02.webp',
        after: { text: 'No! It is a mouse.\nSqueak!', image: 'illustrations/rabbit/02-reveal.webp' }
      },
      {
        bg: 'indoor', text: 'Is Little Rabbit in the [tub]?', image: 'illustrations/rabbit/03.webp',
        after: { text: 'No! It is a duck.\nQuack!', image: 'illustrations/rabbit/03-reveal.webp' }
      },
      {
        bg: 'indoor', text: 'Is Little Rabbit in the [bed]?', image: 'illustrations/rabbit/04.webp',
        after: { text: 'Yes! Here is Little Rabbit.\nGoodnight, Little Rabbit!', image: 'illustrations/rabbit/04-reveal.webp' }
      }
    ],
    end: { bg: 'night', image: 'illustrations/rabbit/end.webp' }
  },
  {
    id: 'twinkle', shelf: 'little', cloth: '#2e3566',
    title: 'Twinkle, Twinkle, Little Star',
    byline: 'by Jane Taylor',
    source: 'From "The Star" in Rhymes for the Nursery (1806). These are the first two of its five verses, with the first sung again at the end.',
    cover: { bg: 'night', image: 'illustrations/twinkle/cover.webp' },
    pages: [
      { bg: 'night', text: 'Twinkle, twinkle, little [star],\nHow I wonder what you are!', image: 'illustrations/twinkle/01.webp' },
      { bg: 'night', text: 'Up above the world so high,\nLike a diamond in the [sky].', image: 'illustrations/twinkle/02.webp' },
      { bg: 'dusk', text: 'When the blazing [sun] is gone,\nWhen he nothing shines upon,', image: 'illustrations/twinkle/03.webp' },
      {
        bg: 'night', text: 'Then you show your little [light],\nTwinkle, twinkle, all the night.',
        image: 'illustrations/twinkle/04.webp'
      },
      { bg: 'night', text: 'Twinkle, twinkle, little [star],\nHow I wonder what you are!', image: 'illustrations/twinkle/05.webp' }
    ],
    end: { bg: 'night', image: 'illustrations/twinkle/end.webp' }
  },
  {
    id: 'hickory', shelf: 'little', cloth: '#7c5a2e',
    title: 'Hickory, Dickory, Dock',
    byline: 'An old nursery rhyme',
    source: 'From The Real Mother Goose (1916), Project Gutenberg eBook #10607.',
    cover: { bg: 'indoor', image: 'illustrations/hickory/cover.webp' },
    pages: [
      { bg: 'indoor', text: 'Hickory, dickory, [dock]!', image: 'illustrations/hickory/01.webp' },
      { bg: 'indoor', text: 'The [mouse] ran up the clock;', image: 'illustrations/hickory/02.webp' },
      {
        bg: 'indoor', text: 'The clock struck [one],', image: 'illustrations/hickory/03.webp',
        after: { text: 'Bong!', image: 'illustrations/hickory/03-reveal.webp' }
      },
      { bg: 'indoor', text: 'And down he [run],', image: 'illustrations/hickory/04.webp' },
      { bg: 'indoor', text: 'Hickory, dickory, [dock]!', image: 'illustrations/hickory/05.webp' }
    ]
  },
  {
    id: 'count', shelf: 'little', cloth: '#8e3b52',
    title: 'One Red Bug',
    byline: 'A counting book',
    source: 'A new story for this library.',
    cover: { bg: 'garden', image: 'illustrations/count/cover.webp' },
    pages: [
      { bg: 'garden', text: 'One red [bug].', image: 'illustrations/count/01.webp' },
      {
        bg: 'pond', text: 'Two green [frogs].',
        image: 'illustrations/count/02.webp'
      },
      {
        bg: 'pond', text: 'Three white [ducks].',
        image: 'illustrations/count/03.webp'
      },
      {
        bg: 'farm', text: 'Four pink [pigs].',
        image: 'illustrations/count/04.webp'
      },
      {
        bg: 'indoor', text: 'Five grey [mice].',
        image: 'illustrations/count/05.webp'
      },
      {
        bg: 'farm', text: 'And one big [cow],\nwith one red bug on her nose!', image: 'illustrations/count/06.webp',
        after: { text: 'Moo!' }
      }
    ],
    end: {
      bg: 'farm',
      image: 'illustrations/count/end.webp'
    }
  },
  {
    id: 'pea', shelf: 'little', cloth: '#4f6b3a',
    title: 'The Princess and the Pea',
    byline: 'by Hans Christian Andersen',
    source: 'After "The Real Princess" in Andersen\'s Fairy Tales, Project Gutenberg eBook #1597. Andersen\'s own Danish has one pea; this old English translation has three, and so does this book.',
    cover: { bg: 'indoor', image: 'illustrations/pea/cover.webp' },
    pages: [
      {
        bg: 'storm', text: 'One stormy night, the rain came pouring down.\nKnock, knock! Who is at the [door]?',
        image: 'illustrations/pea/01.webp',
        after: {
          text: 'It was a princess,\nwet from top to toe!',
          image: 'illustrations/pea/01-reveal.webp'
        }
      },
      {
        bg: 'indoor', text: 'The old queen put three little [peas]\non the bed.',
        image: 'illustrations/pea/02.webp'
      },
      {
        bg: 'indoor', text: 'Then she piled up twenty mattresses,\nand twenty feather [beds] on top.',
        image: 'illustrations/pea/03.webp'
      },
      {
        bg: 'indoor', text: 'The princess climbed up, up, up to the [top],\nand lay down for the night.',
        image: 'illustrations/pea/04.webp'
      },
      {
        bg: 'indoor', text: '"How did you sleep?" asked the queen.\n"Oh, very badly! There was something hard in my [bed].\nI am black and blue all over!"',
        image: 'illustrations/pea/05.webp',
        after: {
          text: 'Only a real princess could feel three little peas\nthrough all those beds!\nSo the prince married her.',
          image: 'illustrations/pea/05-reveal.webp'
        }
      },
      {
        bg: 'indoor', text: 'And the three peas were put in a glass [box],\nwhere you may see them still,\nif they have not been lost!',
        image: 'illustrations/pea/06.webp'
      }
    ],
    end: { bg: 'night', image: 'illustrations/pea/end.webp' }
  },

  {
    id: 'frozen-ice-boat', shelf: 'little', cloth: '#39758b',
    title: 'Frozen: Snow in the Castle',
    byline: 'Anna and Elsa as children',
    source: 'Retold from the opening of Disney’s Frozen (2013).',
    cover: { bg: 'hall', image: 'illustrations/frozen-ice-boat/cover.webp' },
    pages: [
      { bg: 'indoor', text: 'Anna could not sleep.\nShe woke Elsa in [bed].', image: 'illustrations/frozen-ice-boat/01.webp' },
      { bg: 'hall', text: 'Downstairs, Elsa made a little [ball] of snow between her hands.', image: 'illustrations/frozen-ice-boat/02.webp' },
      { bg: 'hall', text: 'Up it went! Soft [snow] fell all around the girls.', image: 'illustrations/frozen-ice-boat/03.webp' },
      { bg: 'hall', text: 'The girls made a snowman. Elsa moved his twig arm.\nAnna gave Olaf a big [hug].', image: 'illustrations/frozen-ice-boat/04.webp' }
    ]
  },
  {
    id: 'cinderella', shelf: 'little', cloth: '#526796',
    title: 'Cinderella and the Glass Slipper',
    byline: 'Midnight at the ball',
    source: 'Retold from Disney’s Cinderella (1950).',
    cover: { bg: 'hall', image: 'illustrations/cinderella/cover.webp' },
    pages: [
      { bg: 'hall', text: 'At the ball, Cinderella danced with the prince.\nThen the [clock] began to strike twelve.', image: 'illustrations/cinderella/01.webp' },
      { bg: 'hall', text: 'She ran down the steps.\nOne glass [shoe] slipped off!', image: 'illustrations/cinderella/02.webp' },
      { bg: 'night', text: 'Away sped her coach. At the last bong, it was a [pumpkin] again.', image: 'illustrations/cinderella/03.webp' },
      { bg: 'night', text: 'Cinderella still had one glass slipper on her [foot].', image: 'illustrations/cinderella/04.webp',
        after: { text: 'The other slipper was back at the palace.' } }
    ]
  },
  {
    id: 'rapunzel', shelf: 'little', cloth: '#725681',
    title: 'Rapunzel and the Floating Lights',
    byline: 'Lantern night on the water',
    source: 'Retold from Disney’s Tangled (2010).',
    cover: { bg: 'nightsea', image: 'illustrations/rapunzel/cover.webp' },
    pages: [
      { bg: 'night', text: 'Each year on her birthday, Rapunzel saw lights from her tall [tower].', image: 'illustrations/rapunzel/01.webp' },
      { bg: 'nightsea', text: 'This year Flynn took her out in a [boat].\nThey waited on the water.', image: 'illustrations/rapunzel/02.webp' },
      { bg: 'night', text: 'At the castle, the [king] and queen let the first lantern go.', image: 'illustrations/rapunzel/03.webp' },
      { bg: 'nightsea', text: 'Soon the whole [sky] was full of lights.\nRapunzel let a lantern float up from her hands.', image: 'illustrations/rapunzel/04.webp' }
    ]
  },
  {
    id: 'ariel', shelf: 'little', cloth: '#357076',
    title: 'The Little Mermaid to the Rescue',
    byline: 'Ariel saves Prince Eric',
    source: 'Retold from Disney’s The Little Mermaid (1989).',
    cover: { bg: 'nightsea', image: 'illustrations/ariel/cover.webp' },
    pages: [
      { bg: 'nightsea', text: 'Ariel swam up to a [ship].\nPrince Eric was on board.', image: 'illustrations/ariel/01.webp' },
      { bg: 'nightsea', text: 'A storm came. The ship caught fire!\nEric went back for his [dog], Max.', image: 'illustrations/ariel/02.webp' },
      { bg: 'nightsea', text: 'Max was safe, but Eric fell into the [sea].\nAriel swam to him.', image: 'illustrations/ariel/03.webp' },
      { bg: 'beach', text: 'Ariel brought Eric to shore.\nAs he woke, he heard her [song].', image: 'illustrations/ariel/04.webp' }
    ]
  },
  /* ================= THE BIG SHELF (about age 5) ================= */
  {
    id: 'hen', shelf: 'big', cloth: '#8a5a1c',
    title: 'The Little Red Hen',
    byline: 'Retold from an old English folk tale',
    source: 'After the 1918 telling by Florence White Williams, Project Gutenberg eBook #18735.',
    cover: { bg: 'farm', image: 'illustrations/hen/cover.webp' },
    pages: [
      { bg: 'farm', text: 'Once upon a time there was a little red [hen].\nOne day she found some wheat.', image: 'illustrations/hen/01.webp' },
      { bg: 'farm', text: '"Who will plant this wheat?" said the hen.\n"Not I," said the [pig].', image: 'illustrations/hen/02.webp' },
      { bg: 'farm', text: '"Not I," said the [cat].', image: 'illustrations/hen/03.webp' },
      { bg: 'farm', text: '"Not I," said the [rat].', image: 'illustrations/hen/04.webp' },
      { bg: 'farm', text: '"Well, then, I will," said the little red hen.\nAnd she did. She [dug] a hole, and planted the wheat.', image: 'illustrations/hen/05.webp' },
      { bg: 'farm', text: 'The wheat grew tall and gold in the [sun].', image: 'illustrations/hen/06.webp' },
      {
        bg: 'farm', text: '"Who will [cut] the wheat?"\n"Not I," said the pig, the cat and the rat.\nSo the little red hen did it all by herself.',
        image: 'illustrations/hen/07.webp'
      },
      { bg: 'farm', text: 'She took the wheat to the mill.\nThen she baked a [big] loaf of bread.', image: 'illustrations/hen/08.webp' },
      {
        bg: 'farm', text: '"Who will [eat] this bread?" said the hen.\n"I will!" said the pig, the cat and the rat.',
        image: 'illustrations/hen/09.webp'
      },
      {
        bg: 'farm', text: '"No, you won\'t," said the little red hen.\n"I will!"\nAnd she did. She [ate] it all up.',
        image: 'illustrations/hen/10.webp'
      }
    ]
  },
  {
    id: 'briar', shelf: 'big', cloth: '#1f4b3a',
    title: 'Brer Rabbit and the Briar Patch',
    byline: 'Retold from an African American folk tale',
    source: 'A trickster tale from African American storytelling, first written down by Joel Chandler Harris in Uncle Remus: His Songs and His Sayings (1880), Project Gutenberg eBook #2306. These are his "The Wonderful Tar-Baby Story" and "How Mr. Rabbit Was Too Sharp for Mr. Fox", told in plain words.',
    cover: { bg: 'wood', image: 'illustrations/briar/cover.webp' },
    pages: [
      {
        bg: 'wood', text: 'Brer Rabbit lived in the wood.\nHe could [hop], and he could [run]!',
        image: 'illustrations/briar/01.webp'
      },
      { bg: 'wood', text: 'Brer Fox was a sly old [fox].\nHe wanted to catch Brer Rabbit.', image: 'illustrations/briar/02.webp' },
      {
        bg: 'wood', text: 'One day Brer Fox got some [tar], and mixed it with turpentine,\nand made it into a figure he called a Tar-Baby.',
        image: 'illustrations/briar/03.webp'
      },
      {
        bg: 'wood', text: 'He set the Tar-Baby in the middle of the big road,\nand then he [hid] in the bushes to see what would happen.',
        image: 'illustrations/briar/04.webp'
      },
      {
        bg: 'wood', text: 'By and by, along came Brer Rabbit, hopping down the road.\n"Good morning!" he said. "Nice weather this morning!"\nThe Tar-Baby said nothing, and Brer Fox, he lay [low].',
        image: 'illustrations/briar/05.webp'
      },
      {
        bg: 'wood', text: '"Are you deaf?" said Brer Rabbit. "If you are, I can holler louder."\n"You\'re stuck up, that\'s what you are! Take off your [hat]\nand say howdy, or I\'ll bust you wide open!"\nThe Tar-Baby said nothing, and Brer Fox, he lay low.',
        image: 'illustrations/briar/06.webp'
      },
      {
        bg: 'wood', text: 'So Brer Rabbit drew back his fist, and blip! He hit the Tar-Baby.\nHis fist stuck fast. He hit it with his other hand, and that stuck.\nHe kicked it, and his feet stuck. He butted it, and his [head] stuck.',
        image: 'illustrations/briar/07.webp'
      },
      {
        bg: 'wood', text: 'Then out came Brer Fox, as innocent as you please.\n"Howdy, Brer Rabbit. You look sort of [stuck] up this morning!"\nAnd he rolled on the ground, and laughed and laughed.',
        image: 'illustrations/briar/08.webp'
      },
      {
        bg: 'wood', text: '"I\'ve got you this time, Brer Rabbit," said Brer Fox.\n"I\'ll pile up some brush and set it on [fire], and roast you!"',
        image: 'illustrations/briar/09.webp',
        after: { text: '"Roast me, Brer Fox," said Brer Rabbit,\n"but please don\'t throw me in the briar patch!"' }
      },
      {
        bg: 'wood', text: '"It\'s too much trouble to light a fire," said Brer Fox,\n"so I\'ll have to [hang] you."',
        image: 'illustrations/briar/10.webp',
        after: { text: '"Hang me as high as you please, Brer Fox," said Brer Rabbit,\n"but please don\'t throw me in the briar patch!"' }
      },
      {
        bg: 'wood', text: '"I haven\'t got any string," said Brer Fox,\n"so I\'ll have to [drown] you."',
        image: 'illustrations/briar/11.webp',
        after: { text: '"Drown me as deep as you please, Brer Fox," said Brer Rabbit,\n"but please don\'t throw me in the briar patch!"' }
      },
      {
        bg: 'wood', text: '"There\'s no water near," said Brer Fox,\n"so I\'ll have to [skin] you."',
        image: 'illustrations/briar/12.webp',
        after: { text: '"Skin me, Brer Fox," said Brer Rabbit. "Pull out my eyes,\ntear out my ears by the roots, and cut off my legs,\nbut please, PLEASE don\'t throw me in the briar patch!"' }
      },
      {
        bg: 'wood', text: 'Brer Fox wanted to hurt Brer Rabbit as badly as he could.\nSo he caught him by the hind legs, and flung him\nright into the middle of the briar [patch].',
        image: 'illustrations/briar/13.webp',
        after: { text: 'There was a great flutter in the bushes where Brer Rabbit landed,\nand Brer Fox hung around to see what would happen.' }
      },
      {
        bg: 'hill', text: 'By and by, somebody called Brer Fox. Way up the hill sat Brer Rabbit on a [log],\ncombing the tar out of his fur with a chip.\n"Bred and born in a briar patch, Brer Fox! Bred and born in a briar patch!"\nAnd he skipped off, as lively as a cricket in the embers.',
        image: 'illustrations/briar/14.webp'
      }
    ]
  },
  {
    id: 'owl', shelf: 'big', cloth: '#5a3550', verse: true,
    title: 'The Owl and the Pussy-Cat',
    byline: 'by Edward Lear',
    source: 'From Nonsense Songs (1871), Project Gutenberg eBook #13647. The words are Lear\'s own.',
    cover: { bg: 'nightsea', image: 'illustrations/owl/cover.webp' },
    pages: [
      {
        bg: 'sea', text: 'The Owl and the Pussy-Cat went to [sea]\nIn a beautiful pea-green [boat]:\nThey took some honey, and plenty of money\nWrapped up in a five-pound note.',
        image: 'illustrations/owl/01.webp'
      },
      {
        bg: 'nightsea', text: 'The Owl looked up to the stars above,\nAnd sang to a small guitar,\n"O lovely Pussy, O Pussy, my [love],\nWhat a beautiful Pussy you are,\nYou are,\nYou are!\nWhat a beautiful Pussy you are!"',
        image: 'illustrations/owl/02.webp'
      },
      {
        bg: 'nightsea', text: 'Pussy said to the Owl, "You elegant fowl,\nHow charmingly sweet you sing!\nOh! let us be married; too long we have tarried:\nBut what shall we do for a [ring]?"',
        image: 'illustrations/owl/03.webp'
      },
      {
        bg: 'day', text: 'They sailed away, for a year and a day,\nTo the land where the bong-tree grows;\nAnd there in a wood a Piggy-wig stood,\nWith a ring at the end of his [nose],\nHis nose,\nHis nose,\nWith a ring at the end of his nose.',
        image: 'illustrations/owl/04.webp'
      },
      {
        bg: 'hill', text: '"Dear [Pig], are you willing to sell for one shilling\nYour ring?" Said the Piggy, "I will."\nSo they took it away, and were married next day\nBy the Turkey who lives on the [hill].',
        image: 'illustrations/owl/05.webp'
      },
      {
        bg: 'nightbeach', text: 'They dined on mince and slices of quince,\nWhich they ate with a runcible [spoon];\nAnd hand in hand, on the edge of the sand,\nThey danced by the light of the [moon],\nThe moon,\nThe moon,\nThey danced by the light of the moon.',
        image: 'illustrations/owl/06.webp'
      }
    ],
    end: { bg: 'nightsea', image: 'illustrations/owl/end.webp' }
  },
  {
    id: 'pip', shelf: 'big', cloth: '#2e5e63',
    title: 'Pip and the Word Tree',
    byline: 'A story about words that come true',
    source: 'A new story for this library.',
    cover: { bg: 'garden', image: 'illustrations/pip/cover.webp' },
    pages: [
      { bg: 'garden', text: 'At the end of Pip\'s garden there was a little green door.\nOne morning, the door was open.\nSo Pip went [in].', image: 'illustrations/pip/01.webp' },
      {
        bg: 'garden', text: 'Inside grew a tree. But it did not grow apples or pears.\nIt grew words!\nPip picked one. It said [cat].',
        image: 'illustrations/pip/02.webp',
        after: { text: 'Pop! Out jumped a cat!', image: 'illustrations/pip/02-reveal.webp' }
      },
      {
        bg: 'garden', text: 'Pip picked another word. It said [hat].',
        image: 'illustrations/pip/03.webp',
        after: { text: 'Pop! A hat landed on the cat.', image: 'illustrations/pip/03-reveal.webp' }
      },
      {
        bg: 'garden', text: 'The next word said [sun].',
        image: 'illustrations/pip/04.webp',
        after: { text: 'Pop! Out came the sun, warm and yellow.', image: 'illustrations/pip/04-reveal.webp' }
      },
      {
        bg: 'garden', text: 'Then Pip found a tiny word. It said [bug].',
        image: 'illustrations/pip/05.webp',
        after: { text: 'Pop! A little red bug landed on Pip\'s nose.\nA-a-a-CHOO!', image: 'illustrations/pip/05-reveal.webp' }
      },
      {
        bg: 'garden', text: 'Pip felt hungry. The next word said [jam].',
        image: 'illustrations/pip/06.webp',
        after: { text: 'Pop! A jar of jam, sticky and sweet. Yum!', image: 'illustrations/pip/06-reveal.webp' }
      },
      {
        bg: 'night', text: 'The sun went down, and Pip gave a big yawn.\nThere was one last word on the tree.\nIt said [bed].',
        image: 'illustrations/pip/07.webp',
        after: { text: 'Pop! A little bed, as soft as moss.\nGoodnight, Pip.', image: 'illustrations/pip/07-reveal.webp' }
      }
    ]
  },
  {
    id: 'pigs', shelf: 'big', cloth: '#a4472f',
    title: 'The Three Little Pigs',
    byline: 'Retold from an old English folk tale',
    source: 'After the telling in Joseph Jacobs\' English Fairy Tales (1890), Project Gutenberg eBook #7439, without the turnips, the apples and the fair. Jacobs\' second pig builds with furze; here it is sticks.',
    cover: { bg: 'day', image: 'illustrations/pigs/cover.webp' },
    pages: [
      { bg: 'day', text: 'Once upon a time there were three little [pigs].\nOne day they set off to build houses of their own.', image: 'illustrations/pigs/01.webp' },
      { bg: 'day', text: 'The first little pig built a house of [straw].\nHe was done in no time at all.', image: 'illustrations/pigs/02.webp' },
      {
        bg: 'day', text: 'Along came a big bad [wolf].\n"Little pig, little pig, let me come in!"\n"No, no! Not by the hair of my chinny chin [chin]!"',
        image: 'illustrations/pigs/03.webp'
      },
      {
        bg: 'day', text: '"Then I\'ll [huff], and I\'ll [puff],\nand I\'ll blow your house in!"',
        image: 'illustrations/pigs/04.webp',
        after: {
          text: 'So he huffed, and he puffed, and he blew the house in,\nand he ate up the little pig.',
          image: 'illustrations/pigs/04-reveal.webp'
        }
      },
      {
        bg: 'day', text: 'The second little pig built a house of sticks.\n"Little pig, little pig, let me come in!"\n"No, no! Not by the hair of my chinny chin [chin]!"',
        image: 'illustrations/pigs/05.webp'
      },
      {
        bg: 'day', text: '"Then I\'ll [huff], and I\'ll [puff],\nand I\'ll blow your house in!"',
        image: 'illustrations/pigs/06.webp',
        after: {
          text: 'So he huffed, and he puffed, and he blew the house in,\nand he ate up the second little pig, too.',
          image: 'illustrations/pigs/06-reveal.webp'
        }
      },
      {
        bg: 'day', text: 'The third little pig built his house of [red] bricks.\n"Little pig, little pig, let me come in!"\n"No, no! Not by the hair of my chinny chin chin!"',
        image: 'illustrations/pigs/07.webp'
      },
      {
        bg: 'day', text: '"Then I\'ll huff, and I\'ll puff, and I\'ll blow your house in!"\nWell, he huffed, and he [puffed], and he puffed and he huffed,\nbut he could not get the house down.',
        image: 'illustrations/pigs/08.webp'
      },
      {
        bg: 'indoor', text: 'The wolf was very angry. "I will come down the chimney and eat you up!"\nSo the little pig hung a big [pot] of water on a blazing fire.',
        image: 'illustrations/pigs/09.webp',
        after: {
          text: 'Just as the wolf was coming down, the pig took off the lid,\nand in fell the wolf. SPLASH!',
          image: 'illustrations/pigs/09-reveal.webp'
        }
      },
      {
        bg: 'indoor', text: 'The little pig put the lid on again, and boiled him up,\nand [ate] him for supper.\nAnd he lived happily ever after.',
        image: 'illustrations/pigs/10.webp'
      }
    ],
    end: { bg: 'day', image: 'illustrations/pigs/end.webp' }
  },
  {
    id: 'goats', shelf: 'big', cloth: '#45607a',
    title: 'The Three Billy Goats Gruff',
    byline: 'Retold from a Norwegian folk tale',
    source: 'After the translation by George Webbe Dasent in Popular Tales from the Norse (1859), Project Gutenberg eBook #8933. The big billy goat\'s rhyme is Dasent\'s own.',
    cover: { bg: 'river', image: 'illustrations/goats/cover.webp' },
    pages: [
      {
        bg: 'hill', text: 'Once upon a time there were three billy goats,\nand the name of all three was Gruff.\nThey wanted to go up the [hill] to eat the sweet green grass.',
        image: 'illustrations/goats/01.webp'
      },
      {
        bg: 'river', text: 'On the way there was a bridge over a river.\nUnder the bridge lived a great ugly [Troll],\nwith eyes as big as saucers and a nose as long as a poker.',
        image: 'illustrations/goats/02.webp'
      },
      {
        bg: 'river', text: 'First came the littlest billy goat Gruff.\n[Trip], trap! Trip, trap! went the bridge.',
        image: 'illustrations/goats/03.webp'
      },
      {
        bg: 'river', text: '"WHO is that tripping over my bridge?" roared the Troll.\n"Now I\'m coming to gobble you [up]!"',
        image: 'illustrations/goats/04.webp'
      },
      {
        bg: 'river', text: '"Oh, no! Don\'t eat me. I\'m too [little]," said the littlest goat.\n"Wait for the second billy goat Gruff. He\'s much bigger."\n"Well, be off with you!" said the Troll.',
        image: 'illustrations/goats/05.webp'
      },
      {
        bg: 'river', text: 'Then came the second billy goat Gruff.\nTRIP, TRAP! TRIP, TRAP! "WHO is that?" roared the Troll.\n"Don\'t [eat] me!" said the second goat.\n"Wait for the big billy goat Gruff."',
        image: 'illustrations/goats/06.webp'
      },
      {
        bg: 'river', text: 'Then came the big billy goat Gruff.\nTRIP, TRAP! TRIP, TRAP!\nThe bridge creaked and groaned, for he was so [big].',
        image: 'illustrations/goats/07.webp'
      },
      {
        bg: 'river', text: '"WHO is that tramping over my bridge?" roared the Troll.\n"It is I, the big billy goat Gruff!"\n"Now I\'m coming to gobble you [up]!"',
        image: 'illustrations/goats/08.webp'
      },
      {
        bg: 'river', text: '"Well, come along! I\'ve got two spears,\nAnd I\'ll poke your eyeballs out at your ears;\nI\'ve got besides two curling-stones,\nAnd I\'ll crush you to bits,\nbody and [bones]."',
        image: 'illustrations/goats/09.webp'
      },
      {
        bg: 'river', text: 'And he flew at the Troll. [Bump]!',
        image: 'illustrations/goats/10.webp',
        after: {
          text: 'He poked his eyes out with his horns,\nand crushed him to bits, body and bones,\nand tossed him out into the river.',
          image: 'illustrations/goats/10-reveal.webp'
        }
      },
      {
        bg: 'hill', text: 'Then the three billy goats went up the hill.\nThey ate and ate, until they were so [fat]\nthey could hardly walk home again.',
        image: 'illustrations/goats/11.webp',
        after: { text: 'Snip, snap, snout.\nThis tale\'s told out.' }
      }
    ]
  },
  {
    id: 'race', shelf: 'big', cloth: '#5e6b2a',
    title: 'The Tortoise and the Hare',
    byline: 'A fable by Aesop',
    source: 'Retold from The Aesop for Children (1919), Project Gutenberg eBook #19994.',
    cover: { bg: 'day', image: 'illustrations/race/cover.webp' },
    pages: [
      {
        bg: 'day', text: 'Hare could run very fast. One day he was making fun of Tortoise.\n"You are so [slow]!" he said. "Do you ever get anywhere?"',
        image: 'illustrations/race/01.webp'
      },
      {
        bg: 'day', text: '"Yes, I do," said Tortoise.\n"I will [run] a race with you, and you will see."\nHare laughed and laughed.',
        image: 'illustrations/race/02.webp'
      },
      {
        bg: 'day', text: 'Fox was the judge. He set a flag at the end of the race.\n"Ready, steady... [go]!"',
        image: 'illustrations/race/03.webp'
      },
      {
        bg: 'day', text: 'Off ran Hare, as fast as the wind.\nOff went Tortoise, one slow [step] at a time.',
        image: 'illustrations/race/04.webp'
      },
      {
        bg: 'day', text: 'Hare was so far ahead that he lay down under a tree.\n"I have lots of time," he said.\n"I will have a little [nap]."',
        image: 'illustrations/race/05.webp'
      },
      {
        bg: 'day', text: 'But Tortoise did not stop.\nStep, step, step. On and on he went,\nright [past] the sleeping Hare.',
        image: 'illustrations/race/06.webp'
      },
      {
        bg: 'day', text: 'At last Hare woke [up].\nWhere was Tortoise? He was nearly at the flag!',
        image: 'illustrations/race/07.webp'
      },
      {
        bg: 'day', text: 'Hare ran as fast as he could.\nBut it was too late. Tortoise had [won]!',
        image: 'illustrations/race/08.webp',
        after: { text: 'Slow and steady wins the race.' }
      }
    ]
  },
  {
    id: 'frog', shelf: 'big', cloth: '#2f5e4a',
    title: 'The Frog Prince',
    byline: 'Retold from a German folk tale',
    source: 'After "The Frog-King, or Iron Henry" in the Brothers Grimm\'s Household Tales, translated by Margaret Hunt (1884), Project Gutenberg eBook #5314. As in the Grimms\' telling, the princess throws the frog against the wall; there is no kiss.',
    cover: { bg: 'wood', image: 'illustrations/frog/cover.webp' },
    pages: [
      {
        bg: 'garden', text: 'In the old days, when wishing still helped, there lived a king\nwhose youngest daughter was so lovely that the [sun] itself,\nwhich has seen so much, was astonished\nwhenever it shone on her face.',
        image: 'illustrations/frog/01.webp'
      },
      {
        bg: 'wood', text: 'Near the castle was a great dark wood,\nand under an old tree in the wood was a [well].\nWhen the day was hot, the princess sat by the cool well,\nand threw her golden ball up high, and caught it.',
        image: 'illustrations/frog/02.webp'
      },
      {
        bg: 'wood', text: 'But one day the ball fell, and rolled straight into the well,\nand the well was so deep that the bottom could not be seen.\nThe princess began to [cry].',
        image: 'illustrations/frog/03.webp'
      },
      {
        bg: 'wood', text: '"What is the matter, princess?" said a voice.\nShe looked round, and there was a [frog],\nstretching his thick, ugly head out of the water.\n"I can help you. But what will you give me if I bring your ball back?"',
        image: 'illustrations/frog/04.webp'
      },
      {
        bg: 'wood', text: '"Whatever you like, dear frog," she said.\n"My clothes, my pearls and jewels,\nand even the golden [crown] I am wearing!"',
        image: 'illustrations/frog/05.webp'
      },
      {
        bg: 'wood', text: '"I don\'t want your clothes, or your jewels, or your crown," said the frog.\n"But if you will let me eat from your little golden plate,\nand drink from your little [cup], and sleep in your little [bed],\nI will bring your ball back up again."',
        image: 'illustrations/frog/06.webp'
      },
      {
        bg: 'wood', text: '"Oh yes, I promise," said the princess.\nBut she thought, "How the silly frog does talk!"\nDown dived the frog, and soon he came up again\nwith the [ball] in his mouth.',
        image: 'illustrations/frog/07.webp'
      },
      {
        bg: 'wood', text: 'She picked up her golden ball, and [ran] home with it.\n"Wait, wait! Take me with you!" croaked the frog. "I can\'t run as fast as you!"\nBut she did not listen, and soon forgot all about the poor frog.',
        image: 'illustrations/frog/08.webp'
      },
      {
        bg: 'hall', text: 'Next day, as she sat at dinner with the king,\nsomething came creeping up the marble stairs, splish splash, splish splash.\nIt knocked, and cried, "Princess, youngest princess,\nopen the [door] for me!"',
        image: 'illustrations/frog/09.webp'
      },
      {
        bg: 'hall', text: 'She opened the door, and there sat the frog! She slammed it shut.\n"My child, what are you so afraid of?" asked the [king].\nWhen she told him, he said, "What you have promised, you must do.\nGo and let him in."',
        image: 'illustrations/frog/10.webp'
      },
      {
        bg: 'hall', text: 'So the frog hopped in, and up onto the table,\nand ate from her little golden [plate].\nBut every mouthful she took nearly choked her.',
        image: 'illustrations/frog/11.webp'
      },
      {
        bg: 'hall', text: 'That night the frog crept to her bed and said,\n"Lift me up, or I will tell your father!"\nThen she was terribly angry. She picked him up,\nand threw him with all her might against the [wall].',
        image: 'illustrations/frog/12.webp',
        after: {
          text: 'But when he fell down, he was no frog,\nbut a king\'s son with beautiful, kind eyes.',
          image: 'illustrations/frog/12-reveal.webp'
        }
      },
      {
        bg: 'day', text: 'Next morning a carriage came, with eight white horses,\nand behind it stood the prince\'s servant, Faithful Henry.\nWhen his master was turned into a frog, Henry had been so sad\nthat he had three iron bands put round his [heart],\nto keep it from bursting with grief.',
        image: 'illustrations/frog/13.webp'
      },
      {
        bg: 'day', text: 'As they drove away, something behind them went [crack]!\n"Henry, the carriage is breaking!"\n"No, master, it is only a band from my heart."\nCrack! Crack! went the other two, for his master was free, and happy.',
        image: 'illustrations/frog/14.webp'
      }
    ],
    end: { bg: 'garden', image: 'illustrations/frog/end.webp' }
  },
  {
    id: 'rose', shelf: 'big', cloth: '#8a3b4f',
    title: 'Briar Rose',
    byline: 'Retold from a German folk tale',
    source: 'After "Briar-Rose" in the Brothers Grimm\'s Household Tales, translated by Margaret Hunt (1884), Project Gutenberg eBook #5314. It is the story better known as Sleeping Beauty.',
    cover: { bg: 'day', image: 'illustrations/rose/cover.webp' },
    pages: [
      {
        bg: 'pond', text: 'A long time ago there lived a king and a queen who said every day,\n"Ah, if only we had a child!"\nOne day, as the queen was bathing, a [frog] crept out of the water,\nand said, "Before a year has gone by, you shall have a daughter."',
        image: 'illustrations/rose/01.webp'
      },
      {
        bg: 'hall', text: 'It came true, and the king was so happy that he held a great feast.\nThere were thirteen Wise Women in the kingdom,\nbut he had only twelve golden [plates] for them to eat from,\nso one of them had to stay at home.',
        image: 'illustrations/rose/02.webp'
      },
      {
        bg: 'hall', text: 'When the feast was over, the Wise Women gave the [baby] their magic gifts:\none gave goodness, another beauty, a third riches,\nand so on, with everything in the world one could wish for.',
        image: 'illustrations/rose/03.webp'
      },
      {
        bg: 'hall', text: 'When eleven had spoken, in came the thirteenth, angry at being left out.\nWithout a word of greeting, she cried out,\n"In her fifteenth year, the king\'s daughter shall prick herself\nwith a [spindle], and fall down dead!"',
        image: 'illustrations/rose/04.webp',
        after: {
          text: 'The twelfth Wise Woman could not undo it, but she could make it softer.\n"It shall not be death," she said,\n"but a deep sleep of a hundred years."',
          image: 'illustrations/rose/04-reveal.webp'
        }
      },
      {
        bg: 'day', text: 'So the king gave orders that every spindle in the whole kingdom\nshould be thrown on the [fire] and burnt.',
        image: 'illustrations/rose/05.webp'
      },
      {
        bg: 'day', text: 'On the very day she turned fifteen, the princess was left alone in the castle.\nShe looked into every room, and at last she came to an old [tower].\nShe climbed the winding stairs, and opened a little door.',
        image: 'illustrations/rose/06.webp'
      },
      {
        bg: 'hall', text: 'There sat an old woman with a spindle, busily spinning.\nThe princess took the spindle, for she wanted to spin too.\nBut she pricked her finger,\nand fell down on the [bed] in a deep sleep.',
        image: 'illustrations/rose/07.webp'
      },
      {
        bg: 'day', text: 'And the whole castle fell asleep with her: the king and queen in the hall,\nthe horses in the stable, the [dogs] in the yard, the flies on the wall.\nEven the cook, who was just going to pull the kitchen boy\'s hair,\nlet him go, and fell asleep.',
        image: 'illustrations/rose/08.webp'
      },
      {
        bg: 'day', text: 'Round the castle there grew a hedge of [thorns],\nhigher every year, until nothing of the castle could be seen,\nnot even the flag on the roof.',
        image: 'illustrations/rose/09.webp'
      },
      {
        bg: 'day', text: 'From time to time a king\'s son came, and tried to get through.\nBut the thorns held fast together, as if they had hands,\nand the princes were caught, and [stuck] fast,\nand died a miserable death.',
        image: 'illustrations/rose/10.webp'
      },
      {
        bg: 'garden', text: 'After a hundred years, another king\'s son came. "I am not afraid," he said.\nAnd when he came near, the hedge was nothing but big, beautiful [roses],\nwhich parted to let him through.',
        image: 'illustrations/rose/11.webp'
      },
      {
        bg: 'hall', text: 'All was so still that he could hear himself breathe.\nAt last he came to the little room in the tower, and there lay Briar Rose,\nso lovely that he could not turn his eyes away.\nHe bent down and gave her a [kiss].',
        image: 'illustrations/rose/12.webp',
        after: {
          text: 'And Briar Rose opened her eyes, and woke,\nand looked at him quite sweetly.',
          image: 'illustrations/rose/12-reveal.webp'
        }
      },
      {
        bg: 'hall', text: 'Then the whole castle woke up. The horses shook themselves,\nthe dogs wagged their tails, the fire flickered up and cooked the meat,\nand the cook gave the kitchen boy such a box on the [ear]\nthat he screamed.',
        image: 'illustrations/rose/13.webp',
        after: {
          text: 'And then the prince and Briar Rose were married with all splendour,\nand they lived contented to the end of their days.',
          bg: 'garden', image: 'illustrations/rose/13-reveal.webp'
        }
      }
    ],
    end: { bg: 'day', image: 'illustrations/rose/end.webp' }
  },
  {
    id: 'aurora-lullaby', shelf: 'big', cloth: '#86536b',
    title: 'Sleeping Beauty: The Forest Dance',
    byline: 'Aurora meets Prince Phillip',
    source: 'Retold from the forest meeting in Disney’s Sleeping Beauty (1959).',
    cover: { bg: 'wood', image: 'illustrations/aurora-lullaby/cover.webp' },
    pages: [
      { bg: 'wood', text: 'Deep in the woods, Aurora sang about the young man in her dream.\nPrince Phillip heard her [song] through the trees.', image: 'illustrations/aurora-lullaby/01.webp' },
      { bg: 'wood', text: 'Her animal friends found a red [hat] and cloak that belonged to the prince.\nThey dressed up to give Aurora a partner.', image: 'illustrations/aurora-lullaby/02.webp' },
      { bg: 'wood', text: 'Aurora took hold of the cloak. Round and round she danced with an [owl] peeking out at her.', image: 'illustrations/aurora-lullaby/03.webp' },
      { bg: 'wood', text: 'Then someone took the owl’s place. Aurora turned and saw a young [man].\nIt was Phillip! Before she ran home, she told him where they could meet again.', image: 'illustrations/aurora-lullaby/04.webp' }
    ]
  },
  {
    id: 'belle', shelf: 'big', cloth: '#91672e',
    title: 'Beauty and the Beast',
    byline: 'A library for Belle',
    source: 'Retold from Disney’s Beauty and the Beast (1991).',
    cover: { bg: 'indoor', image: 'illustrations/belle/cover.webp' },
    pages: [
      { bg: 'hall', text: 'The Beast had a surprise for Belle. He led her to a tall [door] in a part of the castle she had never seen.', image: 'illustrations/belle/01.webp' },
      { bg: 'indoor', text: 'Belle shut her [eyes]. The Beast hurried across the dark room and drew back the curtains.', image: 'illustrations/belle/02.webp' },
      { bg: 'indoor', text: 'When she looked, there were [books] all the way up to the ceiling. Belle turned to take in shelf after shelf.', image: 'illustrations/belle/03.webp' },
      { bg: 'indoor', text: 'Belle loved the library. When the Beast saw her [smile], he gave it to her. She could read here whenever she liked.', image: 'illustrations/belle/04.webp' }
    ]
  },
  {
    id: 'aladdin', shelf: 'big', cloth: '#43517d',
    title: 'Aladdin and the Magic Carpet',
    byline: 'A night flight with Jasmine',
    source: 'Retold from Disney’s Aladdin (1992).',
    cover: { bg: 'night', image: 'illustrations/aladdin/cover.webp' },
    pages: [
      { bg: 'night', text: 'Jasmine looked over the edge of her balcony. There was Aladdin, dressed as a prince, standing on a [rug] that could fly!', image: 'illustrations/aladdin/01.webp' },
      { bg: 'night', text: 'Aladdin held out his [hand]. Jasmine took it and stepped aboard. The carpet lifted them over the palace walls.', image: 'illustrations/aladdin/02.webp' },
      { bg: 'desert', text: 'Over the desert they flew. Far below them, huge pyramids rose out of the [sand].', image: 'illustrations/aladdin/03.webp' },
      { bg: 'night', text: 'In China they stopped on a roof. Jasmine leaned close to Aladdin as fireworks burst in the [sky].', image: 'illustrations/aladdin/04.webp' }
    ]
  }
];
