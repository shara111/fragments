import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  // Apply CommonJS source type for .js files
  { 
    files: ["**/*.js"], 
    languageOptions: { sourceType: "commonjs" } 
  },
  // Add both browser and node globals
  { 
    languageOptions: { 
      globals: { 
        ...globals.browser,   // Keep browser globals
        ...globals.node       // Add Node.js globals (like process, __dirname)
      } 
    } 
  },
  // Use recommended ESLint rules
  pluginJs.configs.recommended,
];
