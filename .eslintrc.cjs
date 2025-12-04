module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
    project: "./tsconfig.base.json",
    tsconfigRootDir: __dirname,
  },
  plugins: ["@typescript-eslint", "react", "react-hooks"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "plugin:react/recommended", "plugin:react-hooks/recommended"],
  settings: {
    react: {
      version: "detect",
    },
  },
  rules: {
    "react/react-in-jsx-scope": "off",
    "@typescript-eslint/explicit-function-return-type": "off"
  },
  ignorePatterns: ["dist", "node_modules", "**/*.d.ts"],
  overrides: [
    {
      files: ["packages/core/**/*.{ts,tsx}"],
      parserOptions: { project: "./packages/core/tsconfig.json" },
    },
    {
      files: ["packages/ui/**/*.{ts,tsx}"],
      parserOptions: { project: "./packages/ui/tsconfig.json" },
    },
    {
      files: ["packages/modules/hello-world/**/*.{ts,tsx}"],
      parserOptions: { project: "./packages/modules/hello-world/tsconfig.json" },
    },
    {
      files: ["apps/web/**/*.{ts,tsx}"],
      parserOptions: { project: "./apps/web/tsconfig.json" },
    },
  ],
};
