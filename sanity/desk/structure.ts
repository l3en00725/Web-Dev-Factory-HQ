// /sanity/desk/structure.ts
// Custom desk structure for Web-Dev-Factory

import type {StructureBuilder} from "sanity/structure";

export const structure = (S: StructureBuilder) =>
  S.list()
    .title("Web Dev Factory")
    .items([
      // Content
      S.listItem()
        .title("Content")
        .child(
          S.list()
            .title("Content")
            .items([
              S.documentTypeListItem("homepage").title("Homepage"),
              S.documentTypeListItem("service").title("Services"),
              S.documentTypeListItem("location").title("Locations"),
              S.documentTypeListItem("testimonial").title("Testimonials"),
            ]),
        ),

      // SEO & Settings
      S.listItem()
        .title("SEO & Settings")
        .child(
          S.list()
            .title("SEO & Settings")
            .items([
              S.documentTypeListItem("settings").title("Site Settings"),
              S.documentTypeListItem("globalSEO").title("Global SEO"),
              S.documentTypeListItem("navItem").title("Navigation"),
            ]),
        ),

      // Leads
      S.listItem()
        .title("Leads")
        .child(
          S.documentTypeList("lead")
            .title("Leads")
            .defaultOrdering([{field: "createdAt", direction: "desc"}]),
        ),
    ]);


