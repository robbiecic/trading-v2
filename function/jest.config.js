module.exports = {
  roots: ["<rootDir>/src-ts"],
  testEnvironment: "jsdom",
  transform: { "\\.ts$": ["ts-jest"] },
  testMatch: ["<rootDir>/src-ts/**/__tests__/**/*.{js,jsx,ts,tsx}", "<rootDir>/src-ts/**/*.{spec,test}.{js,jsx,ts,tsx}"],
  moduleNameMapper: {
    "@/(.*)$": "<rootDir>/src-ts/$1",
  },
  modulePaths: ["<rootDir>"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  verbose: true,
};
