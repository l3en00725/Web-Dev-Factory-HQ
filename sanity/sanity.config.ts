import {defineConfig} from "sanity";
import {structureTool} from "sanity/structure";
import {visionTool} from "@sanity/vision";
import {schemaTypes} from "./schema";

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET || "production";

export default defineConfig({
  name: "web-dev-factory",
  title: "Web Dev Factory",
  projectId,
  dataset,
  plugins: [
    structureTool({
      // TODO: Add custom desk structure for Web-Dev-Factory sites.
      // e.g. structure: (S) => S.list().title("Content").items([...])
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
  },
});


