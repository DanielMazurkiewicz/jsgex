# jsgex
Not a replacement for REGEX, but an alternative that is far more readable and a bit more flexible

# Check tests directory for examples of usage below API functions

## createMatcher
when matcher is created it returns simple function to match within given text and starting at optionally given position 

```javascript
const matchResult = someMatcherCreatedWithOneOfCreateMatchFunc(text, position); //position is optional
```

that function returns an object, an example:

```javascript
{ start: 18,
  result:
   { /*data provided as match result*/ },
  length: 1,
  matched: ')',
  chain: undefined,
  end: 19,
  endOfChains: 19,
  endOfText: 19,
  text: ')' 
}
```

### createMatcher(matcher)

### createMatcher.not(matcher)

### createMatcher.all(matcher, options)

### createMatcher.find(matcher)

### returns(data)

### returns(data).matchAlso(matcher)

### returns(data).extend(extendedData)

### characters(charsListsObject)

# TODO
## prepare nice documentation, this is just quick lazy temporary one ;-)
## consider some performance speedups using regex, function evaluation, JS build in methods