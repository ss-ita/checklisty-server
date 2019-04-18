const regex = /^\s+|\s+$/g;

const checkMessage = (message) => {
  if (message) {
    const noWhitespaceValue = message.replace(regex, '');
    return noWhitespaceValue;
  }

  if (!message || message.match(regex)) {
    return false;
  }

  return null;
};

module.exports = checkMessage;
