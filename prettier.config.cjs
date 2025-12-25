/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import('prettier').Config}
 */
module.exports = {
    plugins: ['prettier-plugin-tailwindcss'],
    semi: false,
    bracketSpacing: true,
    arrowParens: 'always',
    endOfLine: 'lf',
    jsxSingleQuote: true,
    printWidth: 100,
    quoteProps: 'consistent',
    singleQuote: true,
    trailingComma: 'none',
    tabWidth: 4
}
