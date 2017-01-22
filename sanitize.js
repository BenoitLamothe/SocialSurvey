module.exports = {
    sanitizeText: (str) => {
        const twitterRe = /([@#])([a-z\d_]+)/ig;
        const urlRe = /(https?|ftp):\/\/[^\s/$.?#].[^\s]*/ig;
        const alphaRe = /[^A-z\s0-9]+/g;
        return str.replace(twitterRe, "")
            .replace(urlRe, "")
            .replace(alphaRe, "");
    }
};