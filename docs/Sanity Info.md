\# Setting up your studio

\#\# Create a new Studio with Sanity CLI

\!\[Video\](https://stream.mux.com/wIMs3CS7T4pP7hRArpQZsBZ01Be02vCjbK)

Run the command in your Terminal to initialize your project on your local computer.

See the documentation if you are \[having issues with the CLI\](/docs/help/cli-errors).

\*\*Terminal\*\*

\`\`\`sh  
npm create sanity@latest \-- \--dataset production \--template clean \--typescript \--output-path studio-hello-world  
cd studio-hello-world  
\`\`\`

\#\# Run Sanity Studio locally

Inside the directory of the Studio, start the development server by running the following command.

\*\*Terminal\*\*

\`\`\`sh  
\# in studio-hello-world   
npm run dev  
\`\`\`

\#\# Log in to the Studio

\*\*Open\*\* the Studio running locally in your browser from \[http://localhost:3333\](http://localhost:3333).

You should now see a screen prompting you to log in to the Studio. Use the same service (Google, GitHub, or email) that you used when you logged in to the CLI.

\# Defining a schema

\#\# Create a new document type

\!\[Video\](https://stream.mux.com/IfVfAwxfwOKN2khdGCQ3cs5IuF1rYte1)

Create a new file in your Studio’s \`schemaTypes\` folder called \`postType.ts\` with the code below which contains a set of fields for a new \`post\` document type.

\*\*/studio-hello-world/schemaTypes/postType.ts\*\*

\`\`\`  
import {defineField, defineType} from 'sanity'

export const postType \= defineType({  
  name: 'post',  
  title: 'Post',  
  type: 'document',  
  fields: \[  
    defineField({  
      name: 'title',  
      type: 'string',  
      validation: (rule) \=\> rule.required(),  
    }),  
    defineField({  
      name: 'slug',  
      type: 'slug',  
      options: {source: 'title'},  
      validation: (rule) \=\> rule.required(),  
    }),  
    defineField({  
      name: 'publishedAt',  
      type: 'datetime',  
      initialValue: () \=\> new Date().toISOString(),  
      validation: (rule) \=\> rule.required(),  
    }),  
    defineField({  
      name: 'image',  
      type: 'image',  
    }),  
    defineField({  
      name: 'body',  
      type: 'array',  
      of: \[{type: 'block'}\],  
    }),  
  \],  
})  
\`\`\`

\#\# Register the \`post\` schema type to the Studio schema

Now you can import this document type into the \`schemaTypes\` array in the \`index.ts\` file in the same folder.

\*\*/studio-hello-world/schemaTypes/index.ts\*\*

\`\`\`  
import {postType} from './postType'

export const schemaTypes \= \[postType\]  
\`\`\`

\#\# Publish your first document

When you save these two files, your Studio should automatically reload and show your first document type. Click the \`+\` symbol at the top left to create and publish a new \`post\` document.

\# Querying content with GROQ

\#\# Write your first GROQ query

\!\[Video\](https://stream.mux.com/Mc12Sdeu00ugrGuQyz00Du1G4AQZmT36UV)

Open \*\*Vision\*\* in your Studio's top nav bar and paste this query into the \*\*Query\*\* code block field.

\*\*Vision\*\*

\`\`\`groq  
\*\[\_type \== "post"\]{  
  \_id,  
  title,  
  slug,  
  publishedAt  
}  
\`\`\`

\- \`\*\` represents all documents in a dataset as an array  
\- \`\[\_type \== "post"\]\` represents a \*\*filter\*\* to only return matching documents  
\- \`{ \_id, title, slug, publishedAt }\` represents a \*\*projection\*\* which defines the attributes from those documents that you wish to include in the response.

\#\# Run the query

Click \*\*Fetch\*\* to see the JSON output in \*\*Results\*\*. You should see the document you previously published in the results.

Queries run in Vision use your authenticated session, so you will see private documents – which have a \`.\` in the \`\_id\` key, like \`drafts.\`. You will not see when queried from your front end in the next step.

\# Displaying content in an Astro front end

\#\# Install a new Astro application

\!\[Video\](https://stream.mux.com/BRpQTRNc2nAWQweqMyPFw5QoX7019MMOT)

If you have an \*existing\* application, skip this first step and adapt the rest of the lesson to install Sanity dependencies to fetch and render content.

\*\*Run\*\* the following in a new tab or window in your Terminal (keep the Studio running) to create a new Astro application with Tailwind CSS and TypeScript.

\*\*Terminal\*\*

\`\`\`sh  
\# outside your studio directory  
npm create astro@latest astro-hello-world \-- \--template with-tailwindcss \--typescript strict \--skip-houston \--install \--git  
cd astro-hello-world  
\`\`\`

You should now have your Studio and Astro application in two separate, adjacent folders:

\*\*your-project-folder\*\*

\`\`\`text  
├─ /astro-hello-world  
└─ /studio-hello-world  
\`\`\`

\#\# Install Sanity dependencies

\*\*Run\*\* the following inside the \`astro-hello-world\` directory to:

\- Install and configure the official Sanity integration \[@sanity/astro\](https://www.sanity.io/plugins/sanity-astro)  
\- Install \[astro-portabletext\](https://github.com/theisel/astro-portabletext) to render Portable Text

\*\*Terminal\*\*

\`\`\`sh  
\# your-project-folder/astro-hello-world  
npx astro add @sanity/astro \-y  
npm install astro-portabletext  
\`\`\`

\#\# Add Types for Sanity Client

\*\*Update \*\*\`tsconfig.json\` with the following additional code for TypeScript support of Sanity Client.

\*\*/astro-hello-world/src/tsconfig.json\*\*

\`\`\`json  
{  
  // ...other settings  
  "compilerOptions": {  
    "types": \["@sanity/astro/module"\]  
  }  
}

\`\`\`

\#\# Configure the Sanity client

\*\*Update\*\* the integration configuration to configure a Sanity Client to fetch content.

\*\*/astro-hello-world/astro.config.mjs\*\*

\`\`\`  
import tailwindcss from "@tailwindcss/vite";  
import { defineConfig } from "astro/config";

import sanity from "@sanity/astro";

// https://astro.build/config  
export default defineConfig({  
  vite: {  
    plugins: \[tailwindcss()\],  
  },  
  integrations: \[  
    // 👇 update these lines  
    sanity({  
      projectId: "xgztagdf",  
      dataset: "production",  
      useCdn: false, // for static builds  
    }),  
  \],  
});  
\`\`\`

\#\# Start the development server

\*\*Run\*\* the following command and open \[http://localhost:4321\](http://localhost:4321) in your browser.

\*\*Terminal\*\*

\`\`\`sh  
\# your-project-folder/astro-hello-world  
npm run dev  
\`\`\`

\#\# Display content on a posts index page

Astro performs data fetching inside front-matter blocks (\`---\`) at the top of \`.astro\` files

\*\*Create\*\* a route for a page with a list of posts fetched from your Sanity dataset, and visit \[http://localhost:4321/posts\](http://localhost:4321/posts)

\*\*/astro-hello-world/src/pages/posts/index.astro\*\*

\`\`\`tsx  
\---  
import type { SanityDocument } from "@sanity/client";  
import { sanityClient } from "sanity:client";

const POSTS\_QUERY \= \`\*\[  
  \_type \== "post"  
  && defined(slug.current)  
\]|order(publishedAt desc)\[0...12\]{\_id, title, slug, publishedAt}\`;

const posts \= await sanityClient.fetch\<SanityDocument\[\]\>(POSTS\_QUERY);  
\---

\<main class="container mx-auto min-h-screen max-w-3xl p-8"\>  
  \<h1 class="text-4xl font-bold mb-8"\>Posts\</h1\>  
  \<ul class="flex flex-col gap-y-4"\>  
    {posts.map((post) \=\> (  
        \<li class="hover:underline"\>  
          \<a href={\`/posts/${post.slug.current}\`}\>  
            \<h2 class="text-xl font-semibold"\>{post.title}\</h2\>  
            \<p\>{new Date(post.publishedAt).toLocaleDateString()}\</p\>  
          \</a\>  
        \</li\>  
      ))}  
  \</ul\>  
\</main\>  
\`\`\`

\#\# Display individual posts

\*\*Create\*\* a new route for individual post pages.

The dynamic value of a slug when visiting \`/posts/\[slug\]\` in the URL is used as a parameter in the GROQ query used by Sanity Client.

Notice that we’re using \[Tailwind CSS Typography\](https://github.com/tailwindlabs/tailwindcss-typography)’s \`prose\` class name to style the post’s \`body\` block content. Install it in your project following their documentation.

\*\*/astro-hello-world/src/pages/posts/\[slug\].astro\*\*

\`\`\`tsx  
\---  
import type { SanityDocument } from "@sanity/client";  
import { sanityClient } from "sanity:client";  
import imageUrlBuilder from "@sanity/image-url";  
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";  
import { PortableText } from "astro-portabletext";

const POST\_QUERY \= \`\*\[\_type \== "post" && slug.current \== $slug\]\[0\]\`;  
const post \= await sanityClient.fetch\<SanityDocument\>(POST\_QUERY, Astro.params);

export async function getStaticPaths(): Promise\<{ params: { slug: string } }\> {  
  const SLUGS\_QUERY \= \`\*\[\_type \== "post" && defined(slug.current)\]{  
    "params": {"slug": slug.current}  
  }\`;  
  return await sanityClient.fetch(SLUGS\_QUERY, Astro.params);  
}

const { projectId, dataset } \= sanityClient.config();  
const urlFor \= (source: SanityImageSource) \=\>  
  projectId && dataset  
    ? imageUrlBuilder({ projectId, dataset }).image(source)  
    : null;  
const postImageUrl \= post.image  
  ? urlFor(post.image)?.width(550).height(310).url()  
  : null;  
\---

\<main class="container mx-auto min-h-screen max-w-3xl p-8 flex flex-col gap-4"\>  
  \<a href="/posts" class="hover:underline"\>\&larr; Back to posts\</a\>  
  {  
    postImageUrl && (  
      \<img  
        src={postImageUrl}  
        alt={post.title}  
        class="aspect-video rounded-xl"  
        width="550"  
        height="310"  
      /\>  
    )  
  }  
  \<h1 class="text-4xl font-bold mb-8"\>{post.title}\</h1\>  
  \<div class="prose"\>  
    \<p\>Published: {new Date(post.publishedAt).toLocaleDateString()}\</p\>  
    {Array.isArray(post.body) && \<PortableText value={post.body} /\>}  
  \</div\>  
\</main\>  
\`\`\`

\# Deploying Studio and inviting editors

\#\# Deploy your Studio with Sanity

\!\[Video\](https://stream.mux.com/CvYhCQr8e1oZt98NW202BZLLNv376VVKc)

In your Studio directory (\`studio-hello-world\`) run the following command to deploy your Sanity Studio.

\*\*Terminal\*\*

\`\`\`sh  
npm run deploy  
\`\`\`

\#\# Invite a collaborator

Now that you’ve deployed your Studio, you can optionally invite a collaborator to your project. Navigate to your project in \[Sanity Manage\](https://www.sanity.io/manage), then select "Members". 

They will be able to access the deployed Studio, where you can collaborate together on creating content.

