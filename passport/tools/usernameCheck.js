const { transliterate, slugify } = require('transliteration');

const usernameCheck = displayName => {
  let correctUsername = transliterate(displayName);
  correctUsername = slugify(correctUsername, {
    lowercase: false,
    separator: '_'
  });
  return correctUsername;
};

const nameCheck = name => {
  return transliterate(name);
};

module.exports = { usernameCheck, nameCheck };
