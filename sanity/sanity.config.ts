import {defineConfig} from "sanity";
import {structureTool} from "sanity/structure";
import {visionTool} from "@sanity/vision";
import {dashboardTool} from "@sanity/dashboard";
import {schemaTypes} from "./schema";
import {structure} from "./desk/structure";

// Sanity Studio reads from .env files automatically, or use hardcoded values for local dev
const projectId = "m8m8m99r";
const dataset = "production";
export const apiVersion = "2023-10-01";

export default defineConfig({
  name: "web-dev-factory",
  title: "Web Dev Factory",
  projectId,
  dataset,
  plugins: [
    structureTool({
      structure,
    }),
    visionTool(),
    dashboardTool(),
  ],
  schema: {
    types: schemaTypes,
  },
});


