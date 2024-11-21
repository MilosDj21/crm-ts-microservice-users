export default {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "js"],
  testMatch: ["<rootDir>/tests/**/*.test.ts"], // Look for test files in the /tests directory
  collectCoverage: true, // Enable coverage reports
  coverageDirectory: "<rootDir>/coverage", // Save coverage reports in the /coverage directory
  collectCoverageFrom: [
    "<rootDir>/src/**/*.{ts,js}", // Include all TypeScript/JavaScript files in src
    "!<rootDir>/src/**/*.d.ts", // Exclude TypeScript declaration files
  ],
  moduleNameMapper: {
    "^@src/(.*)$": "<rootDir>/src/$1", // Alias for importing from src (optional)
  },
};
