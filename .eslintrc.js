module.exports = {
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:jest/all",
    "plugin:prettier/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
  ],
  parser: "@typescript-eslint/parser",
  rules: {
    "prettier/prettier": 2,
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
