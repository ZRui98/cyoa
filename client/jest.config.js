const config = {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
      "node_modules/variables/.+\\.(j|t)sx?$": "ts-jest"
  },
  transformIgnorePatterns: [
      "node_modules/(?!variables/.*)"
  ],
  runner: "groups",
  testMatch: ["<rootDir>/**/*.unit.ts"]
}
export default config;