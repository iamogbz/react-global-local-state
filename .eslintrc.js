module.exports = {
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:jest/all",
    "plugin:prettier/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ['./tsconfig.json'], // Specify it only for TypeScript files
  },
  rules: {
    "prettier/prettier": 2,
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
