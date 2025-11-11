# Client Site Template

This is a base template for creating new sites with the Web-Dev-Factory-HQ pipeline.

## Getting Started

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview
```

## Project Structure

```
/
├── public/          # Static assets
│   ├── media/       # Images and media files
│   └── images/      # Icons and logos
├── src/
│   ├── layouts/     # Layout components
│   ├── components/  # Reusable components
│   └── pages/       # Route pages
├── data/            # Content JSON files
└── scripts/         # Build and automation scripts
```

## Deployment

Deploy to Vercel from the project root:

```bash
bun run scripts/deploy.mjs --site <site-name> --prod
```

## Pipeline

Run the full automation pipeline:

```bash
bun run scripts/run-pipeline.mjs --site <site-name>
```

