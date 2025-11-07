// Common Library Main Module
// This module exports all the common functionality for the workspace-aure backend

export * from "./src/server/mod.ts";
export * from "./src/auth/mod.ts";
export * from "./src/database/mod.ts";
export * from "./src/utils/mod.ts";

// Version and info
export const VERSION = "1.0.0";
export const LIBRARY_NAME = "@workspace-aure/common-lib";