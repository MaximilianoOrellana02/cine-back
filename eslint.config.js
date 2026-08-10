import js from "@eslint/js";
import globals from "globals";

export default [
    js.configs.recommended,
    {
        files: ["**/*.js"],
        languageOptions: {
            ecmaVersion: 2023,
            sourceType: "module",
            globals: {
                ...globals.node,
            },
        },
        rules: {
            "no-unused-vars": ["warn", { argsIgnorePattern: "^_|^next$" }],
            "no-undef": "error",
            "no-console": "off",
            eqeqeq: ["warn", "always"],
            "prefer-const": "warn",
            "no-var": "error",
        },
    },
];