(function() {

  // sentence length options
  var minSentenceLength = 20,
      maxSentenceLength = 140;

  // convenience functions pertaining to randomness
  var randomInteger = function(min, max) {
    return Math.floor(min + Math.random() * (max - min + 1));
  };

  var randomSelection = function(arr) {
    return arr[randomInteger(0, arr.length - 1)];
  };

  // the actual word list
  var vocabulary = [
    'a', 'ac', 'accumsan', 'adipiscing', 'aenean', 'aliquam', 'aliquet',
    'amet', 'ante', 'arcu', 'at', 'auctor', 'augue', 'bibendum', 'blandit',
    'commodo', 'condimentum', 'congue', 'consectetur', 'consequat',
    'convallis', 'cras', 'cubilia', 'curabitur', 'curae', 'cursus', 'dapibus',
    'diam', 'dictum', 'dignissim', 'dolor', 'donec', 'dui', 'duis', 'e',
    'egestas', 'eget', 'eleifend', 'elementum', 'elit',  'enim', 'eros', 'est',
    'et', 'etiam', 'eu', 'euismod', 'facilisis', 'fames', 'faucibus', 'felis',
    'fermentum', 'feugiat', 'fringilla', 'lacus', 'laoreet', 'lectus', 'leo',
    'libero', 'ligula', 'lobortis', 'lorem', 'luctus', 'maecenas', 'magna',
    'malesuada', 'massa', 'mattis', 'mauris', 'metus', 'mi', 'molestie',
    'mollis', 'morbi', 'nam', 'nec', 'neque', 'netus', 'nibh', 'nisi', 'nisl',
    'non', 'nulla', 'nullam', 'nunc', 'odio', 'orci', 'ornare', 'pellentest',
    'pharetra', 'phasellus', 'placerat', 'porta', 'porttitor', 'posuere',
    'potenti', 'praesent', 'pretium', 'primis', 'proin', 'pulvinar', 'purus',
    'quam', 'quis', 'quisque', 'rhoncus', 'risus', 'rutrum', 'sagittis',
    'sapien', 'scelerisque', 'sed', 'sem', 'semper', 'senectus', 'sit',
    'sodales', 'suscipit', 'suspendisse', 'tellus', 'tempor', 'tempus',
    'tincidunt', 'tortor', 'tristique', 'truculente', 'turpis', 'ullamcorper',
    'ultrices', 'ultricies', 'universita', 'urna', 'ut', 'varius', 'vehicula',
    'vel', 'velit', 'venenatis', 'vestibulum', 'vitae', 'vivamus', 'viverra',
    'volutpat', 'vulputate'
  ];

  // the shortest and longest words in the vocabulary -- note that there
  // must be a word of every length between ´shortest´ and ´longest´!
  var shortest = 1,
      longest = 11;

  // ´wordsByLength´ is an object where each key is an integer and each
  // value is an array of words of that character length
  var wordsByLength = {};

  // populate ´wordsByLength´
  var l = vocabulary.length,
      word, len;
  for (var i = 0; i < l; i++) {
    word = vocabulary[i];
    len = word.length;

    if (wordsByLength[len] instanceof Array) {
      wordsByLength[len].push(word);
    }
    else {
      wordsByLength[len] = [word];
    }
  }

  // returns a punctuated sentence (string) of the specified length
  var buildSentence = function(len) {
    var remaining = len - 1,
        sentence = [];

    var curr, prev;
    while (remaining > longest) {
      do {
        curr = randomSelection(vocabulary);
      }
      while (curr === prev || curr.length > remaining - 3);

      remaining -= curr.length + (prev ? 1 : 0);
      sentence.push(curr);
      prev = curr;
    }

    sentence.push(randomSelection(wordsByLength[remaining - (prev ? 1 : 0)]));
    sentence[0] = sentence[0].charAt(0).toUpperCase() + sentence[0].substr(1);

    return (sentence.join(' ') + '.');
  };

  // returns a paragraph (string) of the specified length
  var buildParagraph = function(len) {
    var paragraph = [],
        remaining = len,
        isFirst = true,
        availableLength, sentenceLength;

    // add sentences until there's only room for one more
    while (remaining > maxSentenceLength) {

      // ´maxLength´ makes sure that the sentence will not be so long that the
      // remaining space will be less than ´minSentenceLength´, but also not
      // longer than ´maxSentenceLength´
      maxLength = Math.min((remaining - minSentenceLength), maxSentenceLength);

      sentenceLength = randomInteger(minSentenceLength, maxLength);
      paragraph.push(buildSentence(sentenceLength));

      // account for the space between sentences (for every sentence after the
      // first one)
      remaining -= sentenceLength + (isFirst ? 0 : 1);

      isFirst = false;
    }

    // use up all the remaining space in the last sentence
    paragraph.push(buildSentence(remaining - (isFirst ? 0 : 1)));

    return paragraph.join(' ');
  };

  // this function is going to be the only thing we expose
  var lobsteripsum = function(min, max) {
    var len;

    if (typeof min !== 'number') {
      throw new Error('lobsteripsum - the first argument is required and '
                    + 'must be a number.');
    }

    if (min < (shortest + 1)) {
      throw new Error('lobsteripsum - the first argument must be at least '
                    + 'one greater than the shortest word in the vocabulary '
                    + '(>=' + (shortest + 1) + '.');
    }

    if (typeof max === 'undefined') {
      len = Math.floor(min);
    }
    else if (typeof max !== 'number') {
      throw new Error('lobsteripsum - the optional second argument must be a '
                    + 'number.');
    }
    else if (max < min) {
      throw new Error('lobsteripsum - the optional second argument must be '
                    + 'greater than or equal to the first argument.');
    }
    else {
      len = randomInteger(min, max);
    }

    return buildParagraph(len);
  };

  // regular expression which parses HTML comments
  var commentRegex = /^\s*lobsteripsum\s+(\d+)(?:\s*-\s*(\d+))?\s*$/i;

  // recursively traverses an HTML element's child nodes and replaces
  // lobsteripsum comments
  lobsteripsum.replaceComments = function(element) {
    var children = element.childNodes,
        len = (children ? children.length : 0),
        child, matches, min, max, str, node;

    for (var i = 0; i < len; i++) {
      child = children[i];

      if (child.nodeType === 1) {
        lobsteripsum.replaceComments(child);
      }
      else if (child.nodeType === 8) {
        matches = child.data.match(commentRegex);

        if (matches) {
          min = parseInt(matches[1]);
          max = matches[2] ? parseInt(matches[2]) : min;

          try {
            str = lobsteripsum(min, max);
          }
          catch (e) {
            // print the error message if something went wrong (most likely due
            // to invalid parameters)
            str = e.message;
          }

          node = document.createTextNode(str);
          element.replaceChild(node, child);
        }
      }
    }
  };

  // use module.exports if running under node.js
  if (typeof module === 'object') {
    module.exports = lobsteripsum;
  }
  else {
    window.lobsteripsum = lobsteripsum;
  }

})();
