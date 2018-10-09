const {createMatcher, returns, characters} = require('../index.js');

const emptyChars = '\n\t\r ';
const mathChars = '+-*/%=';
const logicalChars = '|&^<>!';
const bracketChars = '()[]{}';
const symbolChars = '~$#@?';
const stringChars = '\\\'"`';
const stopChars = ';:,.';
const octaChars = '01234567';
const digitChars = '0123456789';
const hexChars = 'abcdefABCDEF';

const allSpecialChars = emptyChars + mathChars + logicalChars + 
  bracketChars + symbolChars + stringChars + stopChars;


const allNonLettersMatcher = 
  createMatcher(characters({
    '': returns(true),
    [allSpecialChars]: returns(true)
  }));

const onlyMainMatch = {onlyMainMatch: true};
const keywords = {};

const keyData = (category, type, name) => {
  type = type || category;
  name = name || type;

  const result = {category, type, name};
  result[category] = result[type] = result[name] = true;
  return result;
} 
const keyAdd = (key, category, type, name, extension = {}) => {
  const result = keyData(category, type, name);

  if (allNonLettersMatcher(key[key.length-1])) {
    keywords[key] = returns(result).extend(extension);
  } else {
    keywords[key] = returns(result).extend(Object.assign({}, extension, onlyMainMatch))
      .matchAlso(allNonLettersMatcher);
  }
}

//=============================================================

const emptyKeywords = characters({
  [emptyChars]: returns(keyData('empty'))
    .matchAlso(createMatcher.all(
      characters({[emptyChars]: returns(true)}), 
      {min: 0}
    ))
});


const unknownWord = createMatcher.all(
  createMatcher.not(allNonLettersMatcher)
);


const commentsKeywords = {
  '//': returns(keyData('comment', 'single'))
    .matchAlso(createMatcher.find({
      '': returns(true),
      '\n': returns(true),
      '\r': returns(true),
      '\n\r': returns(true),
      '\r\n': returns(true),
    })),
  '/*': returns(keyData('comment', 'multiple'))
    .matchAlso(createMatcher.find({
      '': returns(true),
      '*/': returns(true),
    })),
}

const digitKeywords = Object.assign({},
  characters({
    [digitChars]: returns(keyData('digit', 'decimal'))
      .matchAlso(
        createMatcher.all(
          characters({[digitChars]: returns(true)}), {min: 0}
        )
      )
  }),
  {
    '0b': returns(keyData('digit', 'binary'))
      .matchAlso(createMatcher.all(characters({'01': returns(true)}))),
    '0o': returns(keyData('digit', 'octa'))
      .matchAlso(createMatcher.all(characters({[octaChars]: returns(true)}))),
    '0x': returns(keyData('digit', 'hex'))
      .matchAlso(createMatcher.all(characters({[digitChars + hexChars]: returns(true)}))),
    '0s': returns(keyData('digit', 'base64'))
      .matchAlso(createMatcher.find({'<': returns(true)})),
  }
);

//=============================================================

const dual = {dual: true}
keyAdd('*', 'operator', 'math', 'mul', dual);
keyAdd('/', 'operator', 'math', 'div', dual);
keyAdd('%', 'operator', 'math', 'mod', dual);
keyAdd('+', 'operator', 'math', 'add', dual);
keyAdd('-', 'operator', 'math', 'sub', dual);
keyAdd('^', 'operator', 'math', 'pow', dual);

keyAdd('=', 'assign');

keyAdd('(', 'bracket', 'round', 'r_open');
keyAdd(')', 'bracket', 'round', 'r_close');

keyAdd('.', 'decimals');

keyAdd('sin', 'function', 'sin');
keyAdd('cos', 'function', 'cos');




const allKeywords = Object.assign({}, 
  keywords,

  commentsKeywords,
  digitKeywords, 
  emptyKeywords
);

const tokenMatcher = createMatcher(allKeywords);

const tokenizer = (text) => {
  var tokens = [];
  var position = 0, token;

  while (position < text.length) {
    token = tokenMatcher(text, position);
    if (!token) {
      token = unknownWord(text, position);
      token.result = {nonLangWord: true};
    }

    if (!token.length) break;

    if (token.result && token.result.onlyMainMatch) {
      token.text = text.substring(position, position = token.endOfText = token.end);
    } else {
      token.text = text.substring(position, position = token.endOfText = token.endOfChains);
    }
    tokens.push(token);
  }
  return tokens.filter(t => !t.result.comment && !t.result.empty ).map(t => t.text)
}

console.log(tokenizer(`
  y = 2.3*x*sin(x)
`))

