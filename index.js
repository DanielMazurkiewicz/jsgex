
const createMatcher = (words) => {
  var lettersRoot = {};
  var current, currentLetter, length, lengthOfWord, letter, word, wordLastPosition, position;

  const addWord = (word, data) => {
    current = lettersRoot;
    lengthOfWord = word.length;
    length = lengthOfWord || 1;
    wordLastPosition = length - 1;

    for (position = 0; position < length; position++) {
      letter = word[position] || '';
      currentLetter = current[letter];
      if (!currentLetter) {
        current[letter] = currentLetter = {};
      }
      if (position === wordLastPosition) {
        currentLetter.m = true;       //match
        currentLetter.c = data.chain; //chain
        currentLetter.result = data.result;
        currentLetter.length = lengthOfWord;
        currentLetter.word = word;
      } else {
        if (!currentLetter.next) {
          current = currentLetter.next = {} 
        } else {
          current = currentLetter.next;
        }
      }
    }
  }

  for (word in words) {
    addWord(word, words[word]);
  }

  return (text, position = 0) => {
    var letter, confirmed, chain, current = lettersRoot, currentLetter;
    var endOfChains, end, start = position;

    while (letter !== '') {
      letter = text[position] || '';
      if (letter !== '') position++;
      currentLetter = current[letter];

      if (currentLetter) {
        if (currentLetter.m) {   // if match
          if (currentLetter.c) { // if chain
            if (chain = currentLetter.c(text, position)) { //execute chain
              confirmed = currentLetter;
              end = position;
            }
          } else {
            confirmed = currentLetter;
            end = position;
          }
        }
        current = currentLetter.next;
        if (!current) break;
      } else {
        break;
      }
    }

    if (confirmed) {
      if (chain) {
        endOfChains = chain.endOfChains || end;
      } else {
        endOfChains = end;
      }

      return {
        start,
        result: confirmed.result,
        length: confirmed.length,
        matched: confirmed.word,
        chain,
        end,
        endOfChains
      };  
    }
  }
}


const createNotMatcher = (matcher) => {
  if (typeof matcher !== 'function') {
    matcher = createMatcher(matcher);
  }

  return (text, position = 0) => {
    var matchResult = matcher(text, position);
    if (!matchResult) {
      position++;
      return {
        start: position,
        length: 1,
        matched: text[position - 1],
        end: position,
        endOfChains: position
      }
    }
  }
}

const createAllMatcher = (matcher, options = {}) => {
  if (typeof matcher !== 'function') {
    matcher = createMatcher(matcher);
  }

  var {min, max} = options;
  if (min === undefined) min = 1;
  if (min === undefined) max = Number.MAX_SAFE_INTEGER;
  

  return (text, position = 0) => {
    var length = text.length, matchResult, start = position, result, count = 0;
    while (position < length) {
      matchResult = matcher(text, position);
      if (matchResult) {
        position = matchResult.end;
        result = matchResult;
        count++;
        if (count === max) break;
      } else {
        break;
      }
    }

    if (count >= min && result) {
      result.start = start;
      return result;
    } else {
      return {
        length: 0,
        start,
        end: start,
        endOfChains: start
      }
    }
  }
}


const createFindMatcher = (matcher) => {
  if (typeof matcher !== 'function') {
    matcher = createMatcher(matcher);
  }

  return (text, position = 0) => {
    var length = text.length, matchResult;
    while (position < length) {
      if (matchResult = matcher(text, position)) {
        matchResult.start = position;
        return matchResult;
      } else {
        position++;
      }  
    }
  }
}


const returns = (result) => {
  return {
    result,
    extend,
    matchAlso
  }
}

const matchAlso = function(chain) {
  if (typeof chain !== 'function') {
    chain = createMatcher(chain);
  }

  return Object.assign(this, {chain});

}

const extend = function(extensionResult) {
  const result = Object.assign({}, this.result, extensionResult);
  return Object.assign(this, {result});
}



const characters = (chars) => {
  const result = {};
  var position, length, matchingResult;
  for (var charList in chars) {
    var length = charList.length;
    if (length) {
      matchingResult = chars[charList];
      for (position = 0; position < length; position++) {
        result[charList[position]] = matchingResult;
      }
    } else {
      result[charList] = chars[charList];
    }
  }
  return result;
}

createMatcher.not = createNotMatcher;
createMatcher.all = createAllMatcher;
createMatcher.find = createFindMatcher;


module.exports = {
  createMatcher,
  returns,
  characters
};