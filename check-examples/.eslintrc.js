module.exports = {
    "extends": "google",
    "env": {
        "browser": true 
    },
    "parserOptions": {
        "ecmaVersion": 2017
    },
    "parser": "babel-eslint",
    "rules": {
        "require-jsdoc": "off",
        "eol-last":  "off",
        "comma-dangle": "off",
        "no-unused-vars": "off",
        "max-len": "off",
        "indent": ["error", 2]
    },
    "plugins": [
        "html"
    ],
};