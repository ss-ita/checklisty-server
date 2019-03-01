module.exports = (correctUsername) => {
    const pattern = /\d+$/gm;

    if (correctUsername.match(pattern)) {
        let numOfUsername = correctUsername.match(pattern);
        numOfUsername = Number(numOfUsername[0]) + 1;
        correctUsername = correctUsername.replace(pattern, numOfUsername);
    } else {
        correctUsername = correctUsername + 1;
    }

    return correctUsername;
}
