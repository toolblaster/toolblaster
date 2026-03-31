// HARDCODED RHYME DATA
const hardcodedRhymesData = [
    // PUBLIC RHYMES
    { id: 1, title: "Twinkle, Twinkle, Little Star", category: "Classic", icon: "✨", tags: ["lullaby", "classic"], lyrics: "Twinkle, twinkle, little star,\nHow I wonder what you are!\nUp above the world so high,\nLike a diamond in the sky.\n\nWhen the blazing sun is gone,\nWhen he nothing shines upon,\nThen you show your little light,\nTwinkle, twinkle, all the night.", funFact: "The lyrics are from an early-19th-century English poem by Jane Taylor, 'The Star'. The tune is from an old French melody." },
    { id: 2, title: "Baa, Baa, Black Sheep", category: "Animal", icon: "🐑", tags: ["animal", "classic", "learning"], lyrics: "Baa, baa, black sheep,\nHave you any wool?\nYes, sir, yes, sir,\nThree bags full.\n\nOne for the master,\nOne for the dame,\nAnd one for the little boy\nWho lives down the lane.", funFact: "This rhyme is over 250 years old! It is one of the most popular nursery rhymes in the English language." },
    { id: 3, title: "Machli Jal Ki Rani Hai", title_hi: "मछली जल की रानी है", category: "Indian", icon: "🐠", tags: ["animal", "indian"], lyrics: "Fish, the queen of water,\nHer life is made of water.\nTouch it, and she will be scared,\nTake her out, and she will die.", lyrics_hi: "मछली जल की रानी है,\nजीवन उसका पानी है।\nहाथ लगाओ डर जाएगी,\nबाहर निकालो मर जाएगी।", funFact: "This is one of the first and most popular Hindi rhymes taught to children in India to help them learn about nature." },
    { id: 4, title: "Mary Had a Little Lamb", category: "Animal", icon: "🐑", tags: ["animal", "classic"], lyrics: "Mary had a little lamb,\nIts fleece was white as snow;\nAnd everywhere that Mary went,\nThe lamb was sure to go.\n\nIt followed her to school one day,\nWhich was against the rule;\nIt made the children laugh and play\nTo see a lamb at school.\n\nAnd so the teacher turned him out,\nBut still he lingered near,\nAnd waited patiently about\nTill Mary did appear.", funFact: "This rhyme is based on a real-life incident! A young girl named Mary Sawyer took her pet lamb to school in the 1830s." },
    { id: 5, title: "Jack and Jill", category: "Classic", icon: "👧👦", tags: ["classic"], lyrics: "Jack and Jill went up the hill\nTo fetch a pail of water;\nJack fell down and broke his crown,\nAnd Jill came tumbling after.\n\nUp Jack got and home did trot,\nAs fast as he could caper,\nTo old Dame Dob, who patched his nob\nWith vinegar and brown paper.", funFact: "Some historians think 'Jack and Jill' might be a story about King Louis XVI of France (who lost his 'crown') and his wife Marie Antoinette." },
    { id: 6, title: "Hey Diddle Diddle", category: "Classic", icon: "🐈🎻", tags: ["silly", "animal", "classic"], lyrics: "Hey diddle diddle,\nThe cat and the fiddle,\nThe cow jumped over the moon;\nThe little dog laughed\nTo see such sport,\nAnd the dish ran away with the spoon.", funFact: "This rhyme is pure fun and nonsense! It is designed to be silly and make children laugh with its impossible images." },
    { id: 7, title: "Itsy Bitsy Spider", category: "Animal", icon: "🕷️", tags: ["animal"], lyrics: "The itsy bitsy spider\nClimbed up the waterspout.\nDown came the rain\nAnd washed the spider out.\nOut came the sun\nAnd dried up all the rain,\nAnd the itsy bitsy spider\nClimbed up the spout again.", funFact: "This rhyme teaches a simple lesson about perseverance. Even when things go wrong, you can always try again!" },
    { id: 8, title: "Row, Row, Row Your Boat", category: "Classic", icon: "🚣", tags: ["classic"], lyrics: "Row, row, row your boat,\nGently down the stream.\nMerrily, merrily, merrily, merrily,\nLife is but a dream.", funFact: "This rhyme is often sung in a 'round,' where different groups start singing at different times, creating beautiful harmony." },
    { id: 9, title: "London Bridge Is Falling Down", category: "Classic", icon: "🌉", tags: ["classic"], lyrics: "London Bridge is falling down,\nFalling down, falling down.\nLondon Bridge is falling down,\nMy fair lady.\n\nBuild it up with wood and clay,\nWood and clay, wood and clay,\nBuild it up with wood and clay,\nMy fair lady.", funFact: "The famous London Bridge has been rebuilt many times over the centuries. One of the old bridges was even sold and moved to Arizona, USA!" },
    { id: 13, title: "Hickory Dickory Dock", category: "Learning", icon: "🕰️", tags: ["learning", "animal", "classic"], learningFocus: "Telling Time", lyrics: "Hickory dickory dock,\nThe mouse ran up the clock.\nThe clock struck one,\nThe mouse ran down.\nHickory dickory dock.", funFact: "This rhyme is a fun way to help children learn how to tell time and practice counting." },
    { id: 14, title: "Pat-a-cake, Pat-a-cake", category: "Classic", icon: "🎂", tags: ["classic", "food"], lyrics: "Pat-a-cake, pat-a-cake, baker's man,\nBake me a cake as fast as you can;\nPat it and prick it, and mark it with B,\nAnd put it in the oven for Baby and me.", funFact: "This is one of the oldest English nursery rhymes, often played as a clapping game between a parent and a baby." },
    { id: 15, title: "This Little Piggy", category: "Animal", icon: "🐷", tags: ["animal", "classic"], lyrics: "This little piggy went to market,\nThis little piggy stayed home,\nThis little piggy had roast beef,\nThis little piggy had none.\nThis little piggy cried, 'Wee, wee, wee!' all the way home.", funFact: "This is a popular 'toe play' rhyme, where each line corresponds to wiggling one of a baby's five toes." },
    { id: 17, title: "Ring Around the Rosie", category: "Classic", icon: "🌹", tags: ["classic"], lyrics: "Ring-a-round the rosie,\nA pocket full of posies,\nAshes! Ashes!\nWe all fall down.", funFact: "Many people believe this rhyme is about the Great Plague of London, but historians say there is no real evidence for this. It is most likely just a fun game!" },
    { id: 18, title: "One, Two, Buckle My Shoe", category: "Learning", icon: "👞", tags: ["learning", "classic"], learningFocus: "Counting to 20", lyrics: "One, two, Buckle my shoe;\nThree, four, Knock at the door;\nFive, six, Pick up sticks;\nSeven, eight, Lay them straight.\nNine, ten, A big fat hen;\nEleven, twelve, Dig and delve;\nThirteen, fourteen, Maids a-courting;\nFifteen, sixteen, Maids in the kitchen.\nSeventeen, eighteen, Maids a-waiting;\nNineteen, twenty, My plate's empty.", funFact: "This is a classic counting rhyme that helps children learn their numbers in a fun, memorable way." },
    { id: 23, title: "Chanda Mama", title_hi: "चंदा मामा दूर के", category: "Indian", icon: "🌜", tags: ["indian", "lullaby"], lyrics: "Moon uncle, so far away,\nCooking puddings day by day.\nYou eat from your plate so grand,\nGive me a bowl here in my hand.", lyrics_hi: "चंदा मामा दूर के,\nपुए पकाए बूर के।\nआप खाएं थाली में,\nमुन्ने को दें प्याली में।", funFact: "In Indian culture, the moon is often affectionately called 'Chanda Mama' (Moon Uncle), and is a central character in many lullabies and stories." },
    { id: 26, title: "Humpty Dumpty", category: "Classic", icon: "🥚", tags: ["classic", "silly"], lyrics: "Humpty Dumpty sat on a wall,\nHumpty Dumpty had a great fall.\nAll the king's horses and all the king's men,\nCould not put Humpty together again.", funFact: "Humpty Dumpty was originally a riddle! The answer is an egg. If an egg falls and breaks, you cannot put it back together." },
    { id: 31, title: "Rain, Rain, Go Away", category: "Classic", icon: "☔", tags: ["classic"], lyrics: "Rain, rain, go away,\nCome again another day.\nLittle Johnny wants to play,\nRain, rain, go away.", funFact: null },
    { id: 47, title: "Rock-a-bye Baby", category: "Classic", icon: "👶", tags: ["classic", "lullaby"], lyrics: "Rock-a-bye baby, on the treetop,\nWhen the wind blows, the cradle will rock,\nWhen the bough breaks, the cradle will fall,\nAnd down will come baby, cradle and all.", funFact: null },
    { id: 84, title: "Little Bo-Peep", category: "Classic", icon: "🐑", tags: ["classic", "animal"], lyrics: "Little Bo-Peep has lost her sheep,\nAnd does not know where to find them;\nLeave them alone, and they will come home,\nWagging their tails behind them.", funFact: null },
    
    // EXCLUSIVE RHYMES
    { id: 101, title: "The Friendly Robot", category: "Learning", icon: "🤖", tags: ["learning", "silly"], isExclusive: true, lyrics: "I have a robot, big and grand,\nThe best robot in the land.\nHe helps me clean my room each day,\nThen we both go out to play.", funFact: "The word 'robot' comes from the Czech word 'robota', which means 'forced labor' or 'work'." },
    { id: 103, title: "The Sleepy Bear", title_hi: "सोता भालू", category: "Animal", icon: "🐻", tags: ["animal", "lullaby"], isExclusive: true, lyrics: "The sleepy bear goes to his bed,\nLays down his big and fuzzy head.\nHe dreams of honey, sweet and deep,\nWhile all the little bunnies sleep.", lyrics_hi: "सोता भालू बिस्तर जाए,\nअपना प्यारा सिर टिकाए।\nशहद के मीठे सपने देखे,\nजब खरगोश सब सो जाएं।", funFact: "Bears can sleep for several months during the winter in a process called hibernation." },
    { id: 105, title: "My Rocket Ship Adventure", category: "Learning", icon: "🚀", tags: ["silly", "action"], isExclusive: true, lyrics: "Five, four, three, two, one, we go,\nMy rocket ship is putting on a show!\nPast the clouds and up so high,\nWe'll draw a circle in the sky.\n\nWe zoom around the yellow moon,\nAnd dance among the stars in tune.\nThen we come back home to bed,\nWith sleepy thoughts inside my head.", funFact: "It takes about three days for a rocket to travel from the Earth to the Moon." },
    { id: 106, title: "The Wiggle Worm", category: "Animal", icon: "🐛", tags: ["animal", "action"], isExclusive: true, lyrics: "I'm a little wiggle worm,\nWatch me squirm and squirm.\nI wiggle in the dirt all day,\nThen I wiggle, far away!", funFact: "Earthworms are very helpful because they create tunnels in the soil, which helps air and water reach the roots of plants." },
    { id: 107, title: "The Popcorn Song", category: "Learning", icon: "🍿", tags: ["food", "silly"], isExclusive: true, lyrics: "Pop, pop, popcorn,\nPopping in the pot.\nPop, pop, popcorn,\nEat it while it's hot!\n\nPop, pop, popcorn,\nWhite and fluffy, too.\nPop, pop, popcorn,\nI'll share a piece with you!", funFact: "A single kernel of popcorn can pop up to 3 feet in the air!" },
    { id: 108, title: "My Happy Kite", title_hi: "मेरी प्यारी पतंग", category: "Learning", icon: "🪁", tags: ["action"], isExclusive: true, lyrics: "My kite, my kite, flies in the sky,\nSoaring, soaring, way up high.\nDancing with the wind so free,\nLook, my kite is waving at me!", lyrics_hi: "मेरी पतंग, मेरी पतंग, आसमान में उड़े,\nऊँचे, ऊँचे, बहुत ऊँचे उड़े।\nहवा के संग नाचे आज़ाद,\nदेखो, मेरी पतंग मुझे हिलाए हाथ!", funFact: "Kites were invented in China over 2,000 years ago." },
    { id: 109, title: "The Little Owl", category: "Animal", icon: "🦉", tags: ["animal", "lullaby"], isExclusive: true, lyrics: "The sun is gone, the moon is bright,\nA little owl says, 'Hoo!' at night.\nHe spreads his wings and starts to fly,\nBeneath the starry, sleepy sky.", funFact: "Owls can turn their heads almost all the way around, but they can't move their eyes." },
    { id: 111, title: "Silly Starfish", category: "Animal", icon: "⭐", tags: ["animal", "silly", "ocean"], isExclusive: true, lyrics: "Silly little starfish,\nSpinning in the blue,\nDoing cartwheels in the sea,\nJust for me and you.", funFact: "Starfish can regrow their arms if they lose one!" },
    { id: 112, title: "The Mighty Rex", category: "Animal", icon: "🦖", tags: ["animal", "action"], isExclusive: true, lyrics: "The mighty Rex with a toothy grin,\nMakes the whole jungle shake and spin.\nHe gives a roar, a mighty sound,\nThen takes a nap upon the ground.", funFact: "Despite its ferocious reputation, some scientists think the T-Rex might have had feathers!" },
    { id: 116, title: "Mr. Snail", category: "Animal", icon: "🐌", tags: ["animal"], isExclusive: true, lyrics: "Slowly, slowly, Mr. Snail,\nCrawling down the garden trail.\nHe carries his house upon his back,\nThen hides inside, it's black, black, black.\n\nBut when the sun begins to peek,\nHe slowly lifts his head to speak.\nHe says, 'Hello, my friend, so grand!'\nAnd crawls out on his house-in-hand.", funFact: "Some snails can sleep for up to three years!" },
    { id: 121, title: "Penguin Parade", category: "Animal", icon: "🐧", tags: ["animal", "action"], isExclusive: true, lyrics: "Down the snowy hill they slide,\nWhat a fun and slippery ride!\nThen they waddle, side-by-side,\nIt's the penguin parade!", funFact: "The way penguins waddle actually helps them save energy as they walk." },
    { id: 122, title: "The Baking Song", category: "Learning", icon: "🍪", tags: ["food", "learning"], learningFocus: "Following Steps", isExclusive: true, lyrics: "Mix the flour, crack the egg,\nStir the batter with your leg!\nJust kidding, use a spoon instead,\nTime to make some gingerbread!", funFact: "The tradition of making decorated gingerbread houses started in Germany in the 1800s." },
    { id: 123, title: "The Bouncing Ball", category: "Learning", icon: "⚽", tags: ["action", "silly"], isExclusive: true, lyrics: "A bouncing ball, a bouncing ball,\nBouncing up against the wall.\nIt bounces high, it bounces low,\nWhere will the bouncing ball go?", funFact: "The first basketballs were not bouncy at all! They were made of leather panels stitched together with a rubber bladder inside, much like a soccer ball." },
    { id: 125, title: "The Little Frog", category: "Animal", icon: "🐸", tags: ["animal"], isExclusive: true, lyrics: "A little frog on a lily pad,\nWas feeling just a little sad.\nThen he jumped up with a CROAK!\nAnd that was the best froggy joke.", funFact: "Frogs don't need to drink water; they absorb it through their skin." },
    { id: 127, title: "The Squirrel's Nut", category: "Animal", icon: "🐿️", tags: ["animal"], isExclusive: true, lyrics: "A little squirrel with a tail so grand,\nFound the biggest nut in all the land.\nHe buried it deep beside a tree,\nTo eat in winter, just for he.", funFact: "Squirrels pretend to bury nuts to fool other animals who might be watching them, then they hide the real nut somewhere else!" },
    { id: 129, title: "The Friendly Ghost", category: "Classic", icon: "👻", tags: ["silly", "lullaby"], isExclusive: true, lyrics: "There's a friendly ghost who floats and flies,\nHe has two big and happy eyes.\nHe doesn't want to make you scared,\nHe just wants his teddy bear.\n\nHe finds his bear right on the floor,\nAnd hugs it tight and starts to snore.\nHe's happy now, his day is blessed,\nThe friendly ghost can go to rest.", funFact: "The idea of ghosts being white and floaty comes from old traditions where burial cloths, called shrouds, were usually white." },
    { id: 131, title: "The Happy Dolphin", category: "Animal", icon: "🐬", tags: ["animal", "action"], isExclusive: true, lyrics: "Splash and flip, so fast and free,\nA happy dolphin in the sea.\nHe jumps and clicks and says hello,\nTo all the little fish below.", funFact: "Dolphins sleep with only half of their brain at a time, and they keep one eye open to watch for predators." },
    { id: 132, title: "The Moon's Goodnight", title_hi: "चाँद की शुभरात्रि", category: "Classic", icon: "🌜", tags: ["lullaby"], isExclusive: true, lyrics: "The moon peeks out from cloudy skies,\nAnd winks its sleepy, silver eyes.\nIt's time for bed, you sleepy head,\n'Goodnight, goodnight,' the moonlight said.", lyrics_hi: "चाँद बादलों से झाँके,\nअपनी नींद भरी, चाँदी सी आँखें झपकाए।\nसोने का समय हो गया, मेरे प्यारे,\n'शुभरात्रि, शुभरात्रि,' चाँदनी ने कहा।", funFact: "The moon doesn't make its own light! It reflects the light from the sun, just like a giant mirror in the sky." },
    { id: 133, title: "The Little Boat", category: "Learning", icon: "⛵", tags: ["transport"], isExclusive: true, lyrics: "My little boat upon the sea,\nSails along so happily.\nThe wind it pushes, soft and low,\nThis way and that way we will go.", funFact: "Sailboats don't have engines; they use the power of the wind in their sails to move across the water." },
    { id: 137, title: "The Sleepy Volcano", category: "Classic", icon: "🌋", tags: ["silly", "lullaby"], isExclusive: true, lyrics: "There's a sleepy volcano, taking a nap,\nWith a fluffy white cloud for a thinking cap.\nHe rumbles and grumbles, a sleepy sound,\nShaking the flowers all over the ground.", funFact: "When a volcano erupts, the hot liquid rock that comes out is called lava." },
    { id: 138, title: "The Butterfly", category: "Animal", icon: "🦋", tags: ["animal"], isExclusive: true, lyrics: "A little caterpillar, slow and green,\nBecame the prettiest bug you've seen.\nShe grew some wings and fluttered high,\nA lovely, painted butterfly.", funFact: "Butterflies taste with their feet! It helps them find the right leaf to lay their eggs on." },
    { id: 141, title: "My Little Wooden Horse", category: "Indian", icon: "🐴", tags: ["indian", "animal"], isExclusive: true, lyrics: "Saddle up my horse of wood,\nOn his back, I've always stood.\nWith a tail of rope and a happy sound,\nWe gallop all over the town!", funFact: "Wooden pull-toys have been a childhood classic for hundreds of years, encouraging imagination and play." },
    { id: 142, title: "The City Bus", category: "Classic", icon: "🚌", tags: ["classic", "silly"], isExclusive: true, lyrics: "The big red bus goes beep, beep, beep,\nWhile all the people are asleep.\nThe doors swing open, wide and grand,\nTo take us all across the land.", funFact: "The first city buses were pulled by horses!" },
    { id: 143, title: "My Little Teacup", category: "Classic", icon: "🫖", tags: ["classic"], isExclusive: true, lyrics: "I have a little teacup,\nIt's shiny, small, and round.\nWhen I pour the tea in,\nIt makes a happy sound.", funFact: "Having a tea party with toys and friends is a fun way to practice being a good host." },
    { id: 144, title: "The Happy Peacock", title_hi: "खुश मोर", category: "Indian", icon: "🦚", tags: ["indian", "animal"], isExclusive: true, lyrics: "Grandma saw a peacock bright,\nWith feathers of blue and green.\nHe danced around in the morning light,\nThe prettiest bird she's seen.", lyrics_hi: "नानी ने देखा एक मोर चमकीला,\nपंख थे उसके नीले और हरे।\nसुबह की रोशनी में वो नाचा,\nसबसे सुंदर पक्षी जो उन्होंने देखा।", funFact: "A peacock's long, beautiful feathers are called a 'train'." },
    { id: 146, title: "When I'm Feeling Glad", category: "Learning", icon: "😊", tags: ["learning", "silly", "action"], isExclusive: true, lyrics: "When I'm feeling glad, a happy song I hum,\nI tap my feet just like a little drum.\nI give a wiggle, then a little leap,\nWhile all the grumpy feelings fall asleep.", funFact: "Doing something active, like dancing or jumping, can make you feel even happier!" },
    { id: 147, title: "Panda's Peaceful Snack", category: "Animal", icon: "🐼", tags: ["classic", "animal"], isExclusive: true, lyrics: "A happy panda, soft and grand,\nChews on bamboo in his land.\nMunch, munch, munch, the whole day long,\nHumming a quiet, happy song.", funFact: "Pandas have a special bone in their wrist that acts like a thumb to help them grip bamboo stalks." },
    { id: 148, title: "Clever Monkey", title_hi: "चालाक बंदर", category: "Indian", icon: "🐵", tags: ["indian", "animal", "silly"], isExclusive: true, lyrics: "Monkey wears a silly hat,\nAnd has a friendly chatter-chat.\nHe swings from branches in the sun,\nAnd has a lot of monkey fun.\n\nHe climbs the trees up to the top,\nAnd gives a little playful hop.\nHe pulls a funny face for you,\nAnd waves his tail and says, 'Achoo!'", lyrics_hi: "बंदर पहने एक मज़ेदार टोपी,\nऔर करता है प्यारी बातें।\nधूप में डालियों पर झूलता,\nऔर करता है बंदर वाली मस्ती।\n\nपेड़ों पर चढ़ता ऊपर तक,\nऔर एक छोटी सी छलांग लगाता।\nतुम्हारे लिए एक मज़ेदार चेहरा बनाता,\nऔर अपनी पूँछ हिलाकर कहता, 'आच्छू!'", funFact: "Monkeys use their long tails to help them balance as they swing through the trees." },
    { id: 149, title: "The Mighty Elephant", title_hi: "शक्तिशाली हाथी", category: "Indian", icon: "🐘", tags: ["indian", "animal"], isExclusive: true, lyrics: "Elephant king, so big and gray,\nSwings his trunk along the way.\nHe says hello with a happy toot,\nAnd stomps his great big elephant foot.", lyrics_hi: "हाथी राजा, बड़ा और भूरा,\nरास्ते में अपनी सूंड हिलाता।\nखुशी से एक तूर्य बजाकर नमस्ते कहता,\nऔर अपना बड़ा हाथी पैर पटकता।", funFact: "An elephant's trunk is so strong and skillful it can pick up something as heavy as a log or as small as a single grain of rice." },
    { id: 150, title: "Timothy's Tuba", category: "Classic", icon: "🎺", tags: ["classic", "silly"], isExclusive: true, lyrics: "Timothy found a tuba bright,\nHe puffed his cheeks with all his might.\nInstead of music, out came a pop,\nAnd a shower of lemon drops!", funFact: "Tubas are the largest brass instruments in an orchestra and make the lowest sounds." },
    { id: 152, title: "Silly Billy Goat", category: "Animal", icon: "🐐", tags: ["classic", "silly"], isExclusive: true, lyrics: "Silly Billy Goat went to the fair,\nWith a bright blue ribbon in his hair.\nHe tipped his hat and tapped his toe,\nAnd put on a funny show.\n\nHe balanced books upon his nose,\nAnd jumped and twirled upon his toes.\nHe sang a song and took a bow,\nHe's the silliest goat, you'll agree right now!", funFact: null },
    { id: 154, title: "My Counting Game", category: "Learning", icon: "🔢", tags: ["learning", "classic"], learningFocus: "Counting", isExclusive: true, lyrics: "Let's play a game and count to one,\nTap your head, the game's begun.\nLet's play a game and count to two,\nTouch your nose and then your shoe.\n\nLet's play a game and count to three,\nTouch your tummy, one, two, three.\nLet's play a game and count to four,\nClap your hands and ask for more!", funFact: null },
    { id: 159, title: "Down by the Gate", category: "Classic", icon: "🚪", tags: ["classic", "silly"], isExclusive: true, lyrics: "Down by the gate, gate, gate,\nStood a little cat, cat, cat,\nWith a fuzzy hat, hat, hat,\nImagine that, that, that!", funFact: null },
    { id: 160, title: "The Alphabet's Echo", category: "Learning", icon: "🔤", tags: ["learning"], learningFocus: "Alphabet", isExclusive: true, lyrics: "A is for Achoo! when you sneeze,\nB is for Buzzing like the bees.\nC is for Clapping, one, two, three,\nD is for Dancing, wild and free!", funFact: "The English alphabet has 26 letters, but some languages have many more or many fewer!" },
    { id: 163, title: "Time for a Snack", category: "Classic", icon: "🍎", tags: ["classic", "food"], isExclusive: true, lyrics: "The clock strikes four, it's time to eat,\nTime to eat, time to eat.\nThe clock strikes four, it's time to eat,\nLet's have a tasty treat.", funFact: null },
    { id: 165, title: "A Fuzzy Caterpillar", category: "Animal", icon: "🐛", tags: ["animal"], isExclusive: true, lyrics: "I found a fuzzy caterpillar,\nWon't my mommy be so thrilled with her?\nI found a fuzzy caterpillar,\nWhoops! She's tickling my chin!", funFact: null },
    { id: 166, title: "The Magical Garden", category: "Learning", icon: "🌷", tags: ["learning"], learningFocus: "Imagination", isExclusive: true, lyrics: "In a magical garden, the flowers can sing,\nAnd butterflies whisper on shimmering wing.\nThe clouds are all fluffy like cotton candy sweet,\nA wonderful place for my two little feet.", funFact: null },
    { id: 167, title: "The Little Glimmer Bug", category: "Animal", icon: "🐞", tags: ["animal", "lullaby"], isExclusive: true, lyrics: "A little glimmer bug at night,\nFlashes his tiny, happy light.\nHe dances in the moonlit air,\nWithout a worry, without a care.", funFact: "Fireflies create their light through a chemical reaction in their bodies called bioluminescence." },
    { id: 168, title: "The Dreamland Train", category: "Learning", icon: "🚂", tags: ["lullaby", "transport"], isExclusive: true, lyrics: "The Dreamland Train goes choo-choo-choo,\nCarrying sleepy dreams for you.\nIt chugs along a starry track,\nDon't worry, it will bring them back.", funFact: "Many old steam trains had a 'cowcatcher' on the front, not to catch cows, but to clear obstacles off the tracks." },
    { id: 169, title: "The Cloud Sheep", category: "Classic", icon: "☁️🐑", tags: ["silly", "animal"], isExclusive: true, lyrics: "A fluffy cloud, a sheep so white,\nFloated by in broad daylight.\nHe did a baa-baa in the sky,\nAnd winked his little cloudy eye.", funFact: "Clouds are made of tiny water droplets or ice crystals that are so light they can float in the air." },
    { id: 170, title: "The Toothbrush March", category: "Learning", icon: "🦷", tags: ["learning", "action"], learningFocus: "Personal Hygiene", isExclusive: true, lyrics: "My toothbrush marches left and right,\nTo make my teeth so clean and bright.\nIt marches up and marches down,\nThe cleanest teeth in all the town!", funFact: "It's important to brush your teeth for two minutes, which is about the length of singing 'Twinkle, Twinkle, Little Star' three times!" },
    { id: 171, title: "The Tickle Monster", title_hi: "गुदगुदी वाला राक्षस", category: "Learning", icon: "👻", tags: ["silly", "action"], isExclusive: true, lyrics: "The tickle monster's on the loose,\nHe's not a monster you can shoo!\nWith fuzzy arms and happy feet,\nHe thinks a giggle is a treat.\n\nHe'll tickle toes and sleepy heads,\nAnd chase the grumpies from their beds.\nHe isn't scary, mean, or tall,\nHe just wants to make you laugh, that's all!", lyrics_hi: "गुदगुदी वाला राक्षस है भागा,\nयह ऐसा राक्षस नहीं जिसे तुम भगा सको!\nरोएँदार बाहों और खुश पैरों के साथ,\nउसे खिलखिलाहट एक दावत लगती है।\n\nवह पैर की उंगलियों और नींद वाले सिरों को गुदगुदाएगा,\nऔर उदासी को उनके बिस्तरों से भगा देगा।\nवह डरावना, मतलबी या लंबा नहीं है,\nवह तो बस तुम्हें हँसाना चाहता है, बस इतना ही!", funFact: "Laughing is good for you! It can make you feel happy and relaxed." },
    { id: 172, title: "The Dream Weaver", title_hi: "सपनों का बुनकर", category: "Classic", icon: "🕸️", tags: ["lullaby", "animal"], isExclusive: true, lyrics: "A little spider, kind and bright,\nWeaves happy dreams throughout the night.\nShe takes a thread of moonlight beams,\nAnd spins a web of happy dreams.\n\nShe adds a star, a candy cane,\nA ride upon a choo-choo train.\nSo close your eyes and sleep so deep,\nGood dreams the weaver helps you keep.", lyrics_hi: "एक छोटी मकड़ी, दयालु और उज्ज्वल,\nरात भर खुशियों के सपने बुनती है।\nवह चांदनी की किरणों का एक धागा लेती है,\nऔर खुशियों के सपनों का जाल बुनती है।\n\nवह एक तारा, एक कैंडी केन जोड़ती है,\nएक छुक-छुक गाड़ी की सवारी।\nतो अपनी आँखें बंद करो और गहरी नींद सो जाओ,\nअच्छे सपने बुनकर तुम्हारी मदद करती है।", funFact: "Not all spiders spin webs to catch food. Some use their silk for building homes or protecting their eggs." },
    { id: 173, title: "The Dancing Dinosaur", title_hi: "नाचने वाला डायनासोर", category: "Animal", icon: "💃🦖", tags: ["animal", "silly", "action"], isExclusive: true, lyrics: "A dinosaur with happy feet,\nDanced all day right down the street.\nHe did the wiggle, did the stomp,\nAnd in the puddles, he would chomp!\n\nHe'd twirl around and give a roar,\nThen ask the people, \"Want some more?\"\nThe friendliest dino you could meet,\nWas the one with happy, dancing feet.", lyrics_hi: "एक डायनासोर खुश पैरों वाला,\nसड़क पर दिन भर नाचता था।\nवह मटकता, वह पटकता,\nऔर पोखरों में चबाता था!\n\nवह घूमता और एक दहाड़ लगाता,\nफिर लोगों से पूछता, \"और चाहिए क्या?\"\nसबसे मिलनसार डायनासोर जिससे आप मिल सकते हैं,\nवही था जिसके पैर खुश और नाचने वाले थे।", funFact: "The name Dinosaur means 'terrible lizard' in Greek." },
    { id: 174, title: "The Magic Teapot", title_hi: "जादुई चायदानी", category: "Indian", icon: "🫖", tags: ["silly", "indian", "learning"], isExclusive: true, lyrics: "I have a magic teapot, small and round,\nIt makes a very happy whistling sound.\nWhen I pour the tea, what do I see?\nA tiny little rainbow, just for me!", lyrics_hi: "मेरे पास है जादुई चायदानी, गोल और छोटी,\nजिसकी सीटी बजती है बहुत ही मीठी।\nजब मैं चाय डालता हूँ, तो क्या देखता हूँ?\nएक नन्हा सा इंद्रधनुष, सिर्फ अपने लिए पाता हूँ!", funFact: "Rainbows are formed when sunlight shines through tiny water droplets in the air, acting like a natural prism!" },
    { id: 175, title: "The Jumping Mango", title_hi: "उछलता आम", category: "Indian", icon: "🥭", tags: ["indian", "food", "action"], isExclusive: true, lyrics: "Yellow, yellow mango, sweet and bright,\nJumping in the basket with all its might.\nHop to the left, hop to the right,\nThe yummiest treat for a summer night!", lyrics_hi: "पीला, पीला आम, मीठा और चमकीला,\nटोकरी में उछले, जैसे हो नशीला।\nबाईं ओर कूदे, दाईं ओर जाए,\nगर्मियों की रात में, सब মজे से खाएं!", funFact: "The mango is the national fruit of India, and there are hundreds of different delicious varieties grown all over the country!" },
    { id: 176, title: "Little Monsoon Cloud", title_hi: "नन्हा मानसूनी बादल", category: "Learning", icon: "🌧️", tags: ["learning", "nature", "indian"], isExclusive: true, lyrics: "Little monsoon cloud, fluffy and gray,\nWandering in the sky, ready to play.\nSprinkle some water on the thirsty tree,\nPitter-patter raindrops for you and me!", lyrics_hi: "नन्हा मानसूनी बादल, रुई सा और भूरा,\nआसमान में घूमे, खेल के लिए पूरा।\nप्यासे पेड़ पर थोड़ा पानी छिड़के,\nटिप-टिप बारिश की बूँदें, मेरे और तुम्हारे लिए!", funFact: "Monsoons bring the heavy rains that help farmers grow crops and fill up the rivers during the rainy season!" }
];

// UTILITY: Generate SEO-friendly slug from title
function generateSlug(text) {
    if (!text) return '';
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

window.TB = {
    allRhymes: [],
    currentRhymeList: [],
    favorites: JSON.parse(localStorage.getItem('favoriteRhymes')) || [],
    playlist: (JSON.parse(localStorage.getItem('playlist')) || []).filter(i => i.type === 'rhyme'),
    currentRhyme: null,
    isPlaylistMode: false,
    currentPlaylistIndex: -1
};

document.addEventListener('DOMContentLoaded', () => {
    const rhymeGalleryView = document.getElementById('rhyme-gallery');
    const rhymeDetailView = document.getElementById('rhyme-detail');
    const rhymeOfTheDaySection = document.getElementById('rhyme-of-the-day');
    const rhymeGrid = document.getElementById('rhyme-grid');
    const controlsSection = document.getElementById('controls-section');
    const searchBar = document.getElementById('search-bar');

    let isReading = false;
    let readingQueue = [];
    let englishVoice = null;
    let hindiVoice = null;

    function initVoices() {
        const voices = window.speechSynthesis.getVoices();
        englishVoice = voices.find(v => v.lang === 'en-US' && (v.name.includes('Google') || v.name.includes('Zira'))) || voices.find(v => v.lang === 'en-US');
        hindiVoice = voices.find(v => v.lang === 'hi-IN' && v.name.includes('Google')) || voices.find(v => v.lang === 'hi-IN');
    }
    if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = initVoices;
        initVoices();
    }

    function init() {
        window.TB.allRhymes = [...hardcodedRhymesData].sort((a, b) => a.id - b.id);
        handleUrlParams();
        renderPlaylist();
        addBasicEventListeners();
    }

    window.TB.hideAllViews = function() {
        rhymeGalleryView.classList.add('hidden');
        rhymeDetailView.classList.add('hidden');
        rhymeOfTheDaySection.classList.add('hidden');
        controlsSection.classList.add('hidden');
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        isReading = false;
    }

    window.TB.showMainView = function(viewName) {
        window.TB.hideAllViews();
        controlsSection.classList.remove('hidden');
        resetMetaTags();

        rhymeGalleryView.classList.remove('hidden');
        rhymeOfTheDaySection.classList.remove('hidden');
        
        let rhymesToDisplay;
        let galleryTitleText = "All Tools & Rhymes";
        
        if (viewName === 'Favorites') {
            rhymesToDisplay = window.TB.allRhymes.filter(r => window.TB.favorites.includes(r.id));
            galleryTitleText = "Your Favorites ❤️";
        } else if (viewName === 'Lullaby') {
            rhymesToDisplay = window.TB.allRhymes.filter(r => r.tags && r.tags.includes('lullaby'));
            galleryTitleText = "Lullabies 🌙";
        } else if (['Animal', 'Learning', 'Classic', 'Indian'].includes(viewName)) {
            rhymesToDisplay = window.TB.allRhymes.filter(r => r.category === viewName);
            const icons = { 'Animal': '🐾', 'Learning': '🧠', 'Classic': '📜', 'Indian': '🇮🇳' };
            galleryTitleText = `${viewName} Collection ${icons[viewName] || ''}`;
        } else {
            rhymesToDisplay = window.TB.allRhymes;
            galleryTitleText = "Complete Collection";
        }
        
        const galleryTitleEl = document.getElementById('gallery-title');
        if (galleryTitleEl) galleryTitleEl.textContent = galleryTitleText;
        
        window.TB.displayRhymeGallery(rhymesToDisplay);
        displayRhymeOfTheDay();
    }

    function goHome() {
        searchBar.value = '';
        window.TB.isPlaylistMode = false;
        window.TB.currentPlaylistIndex = -1;
        updateActiveCategoryButton('Rhymes');
        resetMetaTags();
        window.TB.showMainView('Rhymes');
        updateUrl({ category: 'Rhymes' });
    }

    function goBackToGallery() {
        window.TB.isPlaylistMode = false;
        const activeCategory = document.querySelector('.category-btn.active')?.dataset.category || 'Rhymes';
        resetMetaTags();
        window.TB.showMainView(activeCategory);
        updateUrl({ category: activeCategory });
    }

    window.TB.displayRhymeGallery = function(rhymes) {
        window.TB.currentRhymeList = rhymes;
        rhymeGrid.innerHTML = '';
        if (rhymes.length === 0) {
            rhymeGrid.innerHTML = '<p class="text-stone-500 col-span-full text-center py-10 font-medium">No records found matching your criteria.</p>';
            return;
        }
        rhymes.forEach(rhyme => {
            const card = document.createElement('div');
            card.className = 'bg-white border border-stone-200 rounded-2xl p-4 flex flex-col items-center text-center cursor-pointer hover:border-red-500 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 relative';
            card.dataset.rhymeId = rhyme.id;
            
            // FIX: Added SEO Slug to Gallery Anchor Tags
            const slug = generateSlug(rhyme.title);
            card.innerHTML = `
                <a href="?rhyme=${rhyme.id}-${slug}" class="flex-grow flex flex-col items-center justify-center no-underline text-stone-900 w-full h-full">
                    <div class="w-14 h-14 rounded-full bg-stone-50 border border-stone-100 flex items-center justify-center text-2xl mb-3 shadow-inner">
                        ${rhyme.icon || '🎵'}
                    </div>
                    <h3 class="text-xs font-bold text-stone-800 leading-snug px-1">${rhyme.title}</h3>
                </a>
                <div class="absolute top-2 right-2 text-xs favorite-indicator">${window.TB.favorites.includes(rhyme.id) ? '❤️' : ''}</div>
            `;
            
            card.querySelector('a').addEventListener('click', (e) => {
                e.preventDefault();
                window.TB.showRhymeDetail(rhyme.id);
            });
            
            rhymeGrid.appendChild(card);
        });
    }

    window.TB.showRhymeDetail = function(rhymeId, fromPlaylist = false, playlistIndex = -1) {
        window.TB.currentRhyme = window.TB.allRhymes.find(r => r.id === rhymeId);
        if (!window.TB.currentRhyme) return;
        window.TB.hideAllViews();
        rhymeDetailView.classList.remove('hidden');

        // FIX: Generates SEO-Friendly URL with Slug for Canonical & History
        const slug = generateSlug(window.TB.currentRhyme.title);
        const seoUrlParam = `${rhymeId}-${slug}`;
        const rhymeUrl = `https://toolblaster.com/educational/nursery-rhymes-for-kids/?rhyme=${seoUrlParam}`;
        
        updateMetaTags(`${window.TB.currentRhyme.title} | Toolblaster Learning`, `Listen and read ${window.TB.currentRhyme.title}. Toolblaster's interactive learning station.`, rhymeUrl);
        updateUrl({ rhyme: seoUrlParam });
        
        window.TB.isPlaylistMode = fromPlaylist;
        window.TB.currentPlaylistIndex = fromPlaylist ? playlistIndex : -1;
        
        document.getElementById('rhyme-title-en').textContent = window.TB.currentRhyme.title;
        document.getElementById('rhyme-lyrics-en').textContent = window.TB.currentRhyme.lyrics;
        const titleHi = document.getElementById('rhyme-title-hi');
        const hindiCol = document.getElementById('hindi-column');
        if (window.TB.currentRhyme.title_hi) {
            titleHi.textContent = window.TB.currentRhyme.title_hi;
            document.getElementById('rhyme-lyrics-hi').textContent = window.TB.currentRhyme.lyrics_hi;
            hindiCol.classList.remove('hidden');
        } else {
            titleHi.textContent = '';
            hindiCol.classList.add('hidden');
        }

        const learning = document.getElementById('learning-focus-badge-container');
        if (window.TB.currentRhyme.learningFocus) {
            document.getElementById('learning-focus-badge').textContent = `Educational Focus: ${window.TB.currentRhyme.learningFocus}`;
            learning.classList.remove('hidden');
        } else { learning.classList.add('hidden'); }

        const funFact = document.getElementById('fun-fact-container');
        if (window.TB.currentRhyme.funFact) {
            document.getElementById('fun-fact-text').textContent = window.TB.currentRhyme.funFact;
            funFact.classList.remove('hidden');
        } else { funFact.classList.add('hidden'); }

        const copyText = document.getElementById('copyright-text');
        copyText.textContent = window.TB.currentRhyme.isExclusive ? `Copyright © Toolblaster. Original Content.` : `Public Domain Learning Content.`;
        document.getElementById('copyright-notice-container').classList.remove('hidden');

        const favBtn = document.getElementById('favorite-btn');
        favBtn.innerHTML = window.TB.favorites.includes(rhymeId) ? '❤️' : '🤍';
        
        const listToUse = window.TB.currentRhymeList.find(r => r.id === rhymeId) ? window.TB.currentRhymeList : window.TB.allRhymes;
        const idx = listToUse.findIndex(r => r.id === rhymeId);
        document.getElementById('previous-detail-rhyme-btn').disabled = idx <= 0;
        document.getElementById('next-detail-rhyme-btn').disabled = idx >= listToUse.length - 1;

        updateReadAloudBtn(document.getElementById('read-aloud-btn-rhyme'), false);
        updatePlaylistBtns();
        updatePlaylistNav();

        window.scrollTo(0, 0);
    }

    function displayRhymeOfTheDay() {
        const day = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
        const rhyme = window.TB.allRhymes[day % window.TB.allRhymes.length];
        if (!rhyme) return;
        document.getElementById('rotd-icon').textContent = rhyme.icon || '🎵';
        document.getElementById('rotd-title').textContent = rhyme.title;
        document.getElementById('rotd-card').onclick = () => window.TB.showRhymeDetail(rhyme.id);
    }

    function toggleReadAloud() {
        if (!('speechSynthesis' in window)) { window.TB.showToast("TTS not supported in this browser."); return; }
        
        const btn = document.getElementById('read-aloud-btn-rhyme');

        if (isReading) { 
            window.speechSynthesis.cancel(); 
            isReading = false; 
            readingQueue = [];
            updateReadAloudBtn(btn, false);
            return; 
        }

        if (!window.TB.currentRhyme) return;

        let enParts = [window.TB.currentRhyme.lyrics]; 
        let hiParts = window.TB.currentRhyme.lyrics_hi ? [window.TB.currentRhyme.lyrics_hi] : [];

        readingQueue = [];

        const addToQueue = (textArray, lang, voice) => {
            if (!textArray) return;
            textArray.forEach(text => {
                if (!text || !text.trim()) return;
                const u = new SpeechSynthesisUtterance(text);
                u.lang = lang;
                if (voice) u.voice = voice;
                readingQueue.push(u);
            });
        };

        addToQueue(enParts, 'en-US', englishVoice);
        addToQueue(hiParts, 'hi-IN', hindiVoice);

        if (readingQueue.length === 0) return;

        isReading = true;
        updateReadAloudBtn(btn, true);
        
        let currentIdx = 0;

        const playNext = () => {
            if (!isReading) return; 
            if (currentIdx >= readingQueue.length) {
                isReading = false;
                updateReadAloudBtn(btn, false);
                return;
            }
            const utterance = readingQueue[currentIdx];
            utterance.onend = () => { currentIdx++; playNext(); };
            utterance.onerror = (e) => { console.error("TTS Error", e); currentIdx++; playNext(); };
            window.speechSynthesis.speak(utterance);
        };

        playNext();
    }

    function updateReadAloudBtn(btn, active) {
        if(btn) {
            btn.innerHTML = active ? '⏸️' : '📢';
            btn.classList.toggle('text-red-500', active);
            btn.classList.toggle('border-red-500', active);
            btn.title = active ? 'Stop' : 'Read Aloud';
        }
    }

    function toggleFavorite(id, btn) {
        animateBtn(btn);
        const idx = window.TB.favorites.indexOf(id);
        if (idx > -1) window.TB.favorites.splice(idx, 1);
        else window.TB.favorites.push(id);
        
        localStorage.setItem('favoriteRhymes', JSON.stringify(window.TB.favorites));
        btn.innerHTML = idx > -1 ? '🤍' : '❤️';
        
        const card = document.querySelector(`#rhyme-grid .rhyme-card[data-rhyme-id="${id}"] .favorite-indicator`);
        if(card) card.textContent = idx > -1 ? '' : '❤️';
    }

    function togglePlaylistView() {
        const overlay = document.getElementById('playlist-view');
        const sidebar = document.getElementById('playlist-sidebar');
        
        if (overlay.classList.contains('hidden')) {
            renderPlaylist();
            overlay.classList.remove('hidden');
            // Small delay to allow display:block to apply before transforming
            setTimeout(() => {
                sidebar.classList.remove('translate-x-full');
            }, 10);
        } else {
            sidebar.classList.add('translate-x-full');
            setTimeout(() => {
                overlay.classList.add('hidden');
            }, 300);
        }
    }

    function renderPlaylist() {
        const countEl = document.getElementById('playlist-count');
        if (countEl) {
            countEl.textContent = window.TB.playlist.length;
            countEl.classList.toggle('hidden', window.TB.playlist.length === 0);
        }

        const container = document.getElementById('playlist-items');
        container.innerHTML = '';
        
        document.getElementById('clear-playlist-btn').disabled = window.TB.playlist.length === 0;

        if (window.TB.playlist.length === 0) {
            container.innerHTML = '<div class="text-center text-stone-400 py-10"><i class="fa-solid fa-list-ul text-3xl mb-3"></i><p class="font-medium text-sm">Your queue is empty.</p></div>';
            return;
        }

        window.TB.playlist.forEach((item, idx) => {
            let details = window.TB.allRhymes.find(r => r.id === item.id);
            if (!details) return;
            
            const div = document.createElement('div');
            div.className = `flex justify-between items-center p-3 rounded-xl border transition-colors ${window.TB.isPlaylistMode && idx === window.TB.currentPlaylistIndex ? 'bg-red-50 border-red-200' : 'bg-white border-stone-200 hover:border-stone-300'}`;
            div.innerHTML = `
                <div class="cursor-pointer flex-grow flex items-center gap-3" onclick="window.TB.playFromPlaylist(${idx})">
                    <div class="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-sm shadow-inner">
                        ${window.TB.isPlaylistMode && idx === window.TB.currentPlaylistIndex ? '🔊' : (details.icon || '🎵')}
                    </div>
                    <span class="font-bold text-sm text-stone-800">${details.title}</span>
                </div>
                <button class="text-stone-400 hover:text-red-500 w-8 h-8 flex items-center justify-center transition-colors" onclick="window.TB.removeFromPlaylist(${item.id})"><i class="fa-solid fa-trash-can text-xs"></i></button>
            `;
            container.appendChild(div);
        });
    }

    window.TB.playFromPlaylist = function(idx) {
        togglePlaylistView();
        const item = window.TB.playlist[idx];
        window.TB.showRhymeDetail(item.id, true, idx);
    };

    window.TB.removeFromPlaylist = function(id) {
        window.TB.playlist = window.TB.playlist.filter(i => i.id !== id);
        localStorage.setItem('playlist', JSON.stringify(window.TB.playlist));
        renderPlaylist();
        if (window.TB.currentRhyme && window.TB.currentRhyme.id === id) updatePlaylistBtns();
    };

    function addToPlaylist(id, btn) {
        animateBtn(btn);
        const exists = window.TB.playlist.some(i => i.id === id);
        if (exists) {
            window.TB.playlist = window.TB.playlist.filter(i => i.id !== id);
            window.TB.showToast("Removed from queue.");
        } else {
            window.TB.playlist.push({ id, type: 'rhyme' });
            window.TB.showToast("Added to queue!");
        }
        localStorage.setItem('playlist', JSON.stringify(window.TB.playlist));
        renderPlaylist(); 
        updatePlaylistBtns();
    }

    function updatePlaylistBtns() {
        if(window.TB.currentRhyme) {
            const inList = window.TB.playlist.some(i => i.id === window.TB.currentRhyme.id);
            const btn = document.getElementById('add-to-playlist-btn');
            btn.innerHTML = inList ? '<i class="fa-solid fa-check text-green-500"></i>' : '<i class="fa-solid fa-plus text-stone-600"></i>';
        }
    }

    function updatePlaylistNav() {
        const rNav = document.getElementById('playlist-nav-buttons');
        rNav.classList.add('hidden'); 
        
        if (window.TB.isPlaylistMode && window.TB.playlist.length > 0) {
            const pos = document.getElementById('playlist-position');
            const prev = document.getElementById('prev-rhyme-btn');
            const next = document.getElementById('next-rhyme-btn');
            
            rNav.classList.remove('hidden');
            pos.textContent = `Queue: ${window.TB.currentPlaylistIndex + 1} of ${window.TB.playlist.length}`;
            
            const newPrev = prev.cloneNode(true); prev.parentNode.replaceChild(newPrev, prev);
            const newNext = next.cloneNode(true); next.parentNode.replaceChild(newNext, next);
            
            newPrev.onclick = () => { if(window.TB.currentPlaylistIndex > 0) window.TB.playFromPlaylist(window.TB.currentPlaylistIndex - 1); };
            newNext.onclick = () => { if(window.TB.currentPlaylistIndex < window.TB.playlist.length - 1) window.TB.playFromPlaylist(window.TB.currentPlaylistIndex + 1); };
            
            newPrev.disabled = window.TB.currentPlaylistIndex <= 0;
            newNext.disabled = window.TB.currentPlaylistIndex >= window.TB.playlist.length - 1;
        }
    }

    function shareContent() {
        let shareUrl = 'https://toolblaster.com/educational/nursery-rhymes-for-kids/';
        if (window.TB.currentRhyme && !document.getElementById('rhyme-detail').classList.contains('hidden')) {
            // FIX: Ensure share URL also gets the slug
            const slug = generateSlug(window.TB.currentRhyme.title);
            shareUrl += `?rhyme=${window.TB.currentRhyme.id}-${slug}`;
        }

        if (navigator.share) {
            navigator.share({ title: document.title, url: shareUrl }).catch(console.error);
        } else {
            navigator.clipboard.writeText(shareUrl);
            window.TB.showToast('Link copied to clipboard!');
        }
    }

    function surpriseMe() {
        const list = window.TB.allRhymes;
        const item = list[Math.floor(Math.random() * list.length)];
        window.TB.showRhymeDetail(item.id);
    }

    function addBasicEventListeners() {
        document.getElementById('back-button').addEventListener('click', goBackToGallery);
        
        searchBar.addEventListener('input', () => {
             const val = searchBar.value.toLowerCase();
             const galleryTitleEl = document.getElementById('gallery-title');
             if (galleryTitleEl && val.length > 0) {
                 galleryTitleEl.textContent = `Results for "${val}"`;
             } else if (galleryTitleEl) {
                 const activeCategory = document.querySelector('.category-btn.active')?.dataset.category || 'Rhymes';
                 const icons = { 'Animal': '🐾', 'Learning': '🧠', 'Classic': '📜', 'Indian': '🇮🇳', 'Lullaby': '🌙', 'Favorites': '❤️' };
                 galleryTitleEl.textContent = val.length === 0 && activeCategory !== 'Rhymes' ? `${activeCategory} Collection ${icons[activeCategory] || ''}` : `All Rhymes`;
             }
             window.TB.displayRhymeGallery(window.TB.allRhymes.filter(r => r.title.toLowerCase().includes(val) || r.lyrics.toLowerCase().includes(val)));
        });

        document.getElementById('category-filters').addEventListener('click', (e) => {
            const btn = e.target.closest('.category-btn');
            if (btn) {
                const cat = btn.dataset.category;
                updateActiveCategoryButton(cat);
                window.TB.showMainView(cat);
                updateUrl({ category: cat });
            }
        });

        document.getElementById('previous-detail-rhyme-btn').addEventListener('click', () => {
            const list = window.TB.currentRhymeList.length ? window.TB.currentRhymeList : window.TB.allRhymes;
            const idx = list.findIndex(r => r.id === window.TB.currentRhyme.id) - 1;
            if(idx >= 0 && idx < list.length) window.TB.showRhymeDetail(list[idx].id);
        });

        document.getElementById('next-detail-rhyme-btn').addEventListener('click', () => {
            const list = window.TB.currentRhymeList.length ? window.TB.currentRhymeList : window.TB.allRhymes;
            const idx = list.findIndex(r => r.id === window.TB.currentRhyme.id) + 1;
            if(idx >= 0 && idx < list.length) window.TB.showRhymeDetail(list[idx].id);
        });

        document.getElementById('read-aloud-btn-rhyme').addEventListener('click', toggleReadAloud);
        document.getElementById('favorite-btn').addEventListener('click', (e) => toggleFavorite(window.TB.currentRhyme.id, e.currentTarget));
        document.getElementById('add-to-playlist-btn').addEventListener('click', (e) => addToPlaylist(window.TB.currentRhyme.id, e.currentTarget));
        
        document.getElementById('playlist-toggle-btn').addEventListener('click', togglePlaylistView);
        document.getElementById('close-playlist-btn').addEventListener('click', togglePlaylistView);
        document.getElementById('clear-playlist-btn').addEventListener('click', () => { window.TB.playlist = []; localStorage.setItem('playlist', '[]'); renderPlaylist(); });
        document.getElementById('share-rhyme-btn').addEventListener('click', shareContent);
        document.getElementById('print-rhyme-btn').addEventListener('click', () => { document.body.classList.add('printing-rhyme'); window.print(); document.body.classList.remove('printing-rhyme'); });
        document.getElementById('surprise-button').addEventListener('click', surpriseMe);
    }

    function updateActiveCategoryButton(cat) {
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active', 'bg-red-500', 'text-white');
            btn.classList.add('bg-stone-100', 'text-stone-600');
        });
        const activeBtn = document.querySelector(`.category-btn[data-category="${cat}"]`);
        if (activeBtn) {
            activeBtn.classList.remove('bg-stone-100', 'text-stone-600');
            activeBtn.classList.add('active', 'bg-red-500', 'text-white');
        }
    }

    const origTitle = document.title;
    const origDesc = document.querySelector('meta[name="description"]').getAttribute('content');
    
    function updateMetaTags(t, d, url) {
        document.title = t;
        const descMeta = document.querySelector('meta[name="description"]');
        if (descMeta) descMeta.setAttribute('content', d);
        
        const ogUrl = document.querySelector('meta[property="og:url"]');
        if (ogUrl) ogUrl.setAttribute('content', url);
        
        let link = document.querySelector('link[rel="canonical"]');
        if (!link) {
            link = document.createElement('link');
            link.rel = 'canonical';
            document.head.appendChild(link);
        }
        link.setAttribute('href', url);
    }
    
    function resetMetaTags() { updateMetaTags(origTitle, origDesc, 'https://toolblaster.com/educational/nursery-rhymes-for-kids/'); }
    
    function updateUrl(params) {
        const url = new URL(window.location);
        url.search = '';
        let isDetail = false;
        for (const k in params) { if(params[k]) { url.searchParams.set(k, params[k]); if(['rhyme'].includes(k)) isDetail=true; } }
        window.history.pushState({}, '', url);
        const canonicalUrl = isDetail ? `https://toolblaster.com/educational/nursery-rhymes-for-kids/${url.search}` : 'https://toolblaster.com/educational/nursery-rhymes-for-kids/';
        updateMetaTags(isDetail ? document.title : origTitle, isDetail ? document.querySelector('meta[name="description"]').getAttribute('content') : origDesc, canonicalUrl);
    }

    function handleUrlParams() {
        const p = new URLSearchParams(window.location.search);
        // FIX: The parameter might now be "3-twinkle-twinkle-little-star"
        // parseInt("3-twinkle-twinkle") automatically extracts '3', keeping logic intact!
        if (p.get('rhyme')) window.TB.showRhymeDetail(parseInt(p.get('rhyme')));
        else if (p.get('category')) { updateActiveCategoryButton(p.get('category')); window.TB.showMainView(p.get('category')); }
        else { resetMetaTags(); window.TB.showMainView('Rhymes'); }
    }
    
    function animateBtn(btn) {
        btn.classList.add('animate-pop');
        setTimeout(() => btn.classList.remove('animate-pop'), 300);
    }

    window.TB.showToast = function(msg) {
        const t = document.getElementById('toast-notification');
        t.textContent = msg;
        t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 2500);
    };

    init();
});