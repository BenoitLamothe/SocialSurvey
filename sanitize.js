module.exports = {
    sanitizeText: (str) => {
        const twitterRe = /([@#])([a-z\d_]+)/i;
        const urlRe = /(https?|ftp):\/\/[^\s/$.?#].[^\s]*/i;

        return str.replace(twitterRe, "")
                   .replace(urlRe, "");
    }
};