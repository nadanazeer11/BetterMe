/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.ts"],
  // Tests live next to the code they test (e.g. lib/__tests__/foo.test.ts)
  // and only cover pure logic. Native-dependent code (Drizzle queries, hooks)
  // is exercised in the running app, not here.
};
