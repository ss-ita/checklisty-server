const { transliterate, slugify } = require('transliteration');

module.exports = (displayName) => {
  let correctUsername = transliterate(displayName);
  correctUsername = slugify(correctUsername,
    { lowercase: false, separator: '_'}
  );
  return correctUsername;
}
