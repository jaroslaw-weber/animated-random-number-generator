# @random-number-animation/web

The web application version of the animated random number generator, built with Astro. This package provides a fast, static web experience that can be deployed to any hosting platform.

## 📦 Installation

This package is part of the monorepo workspace. Install dependencies from the root:

```sh
bun install
```

## 🚀 Running the Application

### Development Server

```sh
cd packages/web
bun run dev
```

Open [http://localhost:4321](http://localhost:4321) to view the application.

### Production Build

```sh
cd packages/web
bun run build
```

### Preview Production Build

```sh
cd packages/web
bun run preview
```

## 🏗️ Architecture

### Pages

- **`index.astro`** - Main page with the marble race
- **`config.astro`** - Configuration page for game settings

### Layouts

- **`Layout.astro`** - Base layout with common styling and structure

### Components

The web package uses React components from the core package:
- `MarbleRace` - Main game component
- `ConfigForm` - Configuration interface

## 🎮 Features

- **Fast Loading**: Astro's static generation for optimal performance
- **SEO Friendly**: Proper meta tags and semantic HTML
- **Responsive Design**: Works on desktop and mobile devices
- **Client-Side Interactivity**: React components for dynamic features
- **Static Deployment**: Can be deployed to any static hosting service

## 🔧 Development

### Project Structure

```
packages/web/
├── src/
│   ├── components/          # Astro/React components
│   ├── layouts/            # Page layouts
│   ├── pages/              # Astro pages
│   └── env.d.ts            # TypeScript declarations
├── public/                 # Static assets
│   ├── favicon.svg
│   └── marble.png
├── astro.config.mjs        # Astro configuration
├── package.json
├── tsconfig.json
└── README.md
```

### Adding New Pages

1. Create a new `.astro` file in `src/pages/`
2. Import components from the core package as needed
3. Use `client:*` directives for interactive components

Example:
```astro
---
import { MarbleRace } from '@random-number-animation/core';
---

<html>
  <head>
    <title>New Page</title>
  </head>
  <body>
    <MarbleRace client:only="react" />
  </body>
</html>
```

## 🚀 Deployment

### Static Hosting

The built application can be deployed to any static hosting service:

1. Build the application:
   ```sh
   bun run build
   ```

2. Deploy the `dist/` folder to your hosting provider

### Supported Platforms

- **GitHub Pages** - Free static hosting
- **Netlify** - CDN with continuous deployment
- **Vercel** - Serverless platform
- **AWS S3 + CloudFront** - Scalable hosting
- **Any static host** - FTP, etc.

### GitHub Pages Example

1. Build the project:
   ```sh
   bun run build
   ```

2. Deploy to GitHub Pages:
   ```sh
   bun add -D gh-pages
   bun run build
   bunx gh-pages -d dist
   ```

## ⚙️ Configuration

### Astro Configuration

The `astro.config.mjs` file contains:
- React integration setup
- Build output settings
- Development server configuration

### Environment Variables

Create a `.env` file for environment-specific settings:
```env
PUBLIC_API_URL=https://api.example.com
```

## 🔗 Dependencies

- **Astro 5+** - Static site builder
- **React 19+** - UI framework
- **Phaser 3.90+** - Game engine
- **`@random-number-animation/core`** - Shared components

## 🎨 Styling

The application uses:
- **Astro's scoped styles** - Component-level CSS
- **Global styles** - In layout files
- **Tailwind CSS** - Utility-first CSS framework (if configured)

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🐛 Troubleshooting

### Common Issues

**Phaser not loading:**
- Ensure `client:only="react"` directive is used
- Check browser console for errors

**Build failures:**
- Verify core package is built first
- Check TypeScript compilation errors

**Styling issues:**
- Confirm CSS is properly scoped
- Check for conflicting global styles

## 📝 License

MIT License - see root package for details.