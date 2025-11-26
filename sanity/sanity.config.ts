import {defineConfig} from "sanity";
import {structureTool} from "sanity/structure";
import {visionTool} from "@sanity/vision";
import {dashboardTool} from "@sanity/dashboard";
import {schemaTypes} from "./schema";
import {structure} from "./desk/structure";

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET || "production";
export const apiVersion = process.env.SANITY_API_VERSION || "2023-10-01";

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


