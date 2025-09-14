# Animated Random Number Generator

A monorepo project featuring an interactive animated marble race that demonstrates random number generation through engaging visualizations. Available as both a web application and desktop app.

## 🌐 Live Demo

Experience the web version: [Animated Marble Race](https://jaroslaw-weber.github.io/animated-random-number-generator/)

## 📦 Packages

This monorepo contains three packages:

- **[`@random-number-animation/core`](./packages/core/)** - Shared React components and Phaser game logic
- **[`@random-number-animation/web`](./packages/web/)** - Astro-based web application
- **[`@random-number-animation/electron`](./packages/electron/)** - Electron desktop application

## ✨ Features

* **Animated Marble Race**: Watch marbles race to the finish line with smooth Phaser animations
* **Random Number Generation**: Visual demonstration of random outcomes in a game context
* **Multiple Platforms**: Available as web app and desktop application
* **Configurable Settings**: Customize number ranges, names, and game parameters
* **No Repeats Mode**: Elimination-style racing where numbers aren't repeated
* **Modern Tech Stack**: Built with React, Phaser, Astro, and Electron

## 🛠️ Technologies Used

* [React](https://react.dev/) - UI components
* [Phaser](https://phaser.io/) - HTML5 game framework for animations
* [Astro](https://astro.build/) - Static site builder for web version
* [Electron](https://electronjs.org/) - Cross-platform desktop app framework
* [TypeScript](https://www.typescriptlang.org/) - Type-safe development
* [Bun](https://bun.sh/) - Fast JavaScript runtime and package manager

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/docs/installation) (recommended) or npm
- Node.js 18+

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/jaroslaw-weber/animated-random-number-generator.git
   cd animated-random-number-generator
   ```

2. Install dependencies:
   ```sh
   bun install
   ```

### Running the Applications

#### Web Version
```sh
cd packages/web
bun dev
```
Open [http://localhost:4321](http://localhost:4321)

#### Desktop Version
```sh
cd packages/electron
bun dev
```

## 📖 Documentation

Each package contains its own README with specific setup and usage instructions:

- [Core Package README](./packages/core/README.md)
- [Web Package README](./packages/web/README.md)
- [Electron Package README](./packages/electron/README.md)

## 🏗️ Project Structure

```
animated-random-number-generator/
├── packages/
│   ├── core/          # Shared React components and game logic
│   ├── web/           # Astro web application
│   └── electron/      # Electron desktop app
├── package.json       # Root package with workspaces
└── README.md          # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test across all packages
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👀 Learn More

- [Astro Documentation](https://docs.astro.build)
- [Phaser 3 Documentation](https://phaser.io/phaser3)
- [Electron Documentation](https://electronjs.org/docs)
