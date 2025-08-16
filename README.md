# Animated Marble Race Random Number Generator

This project is an interactive web application that simulates an animated marble race, demonstrating random number generation in a visually engaging way. Built with Astro and Phaser, it provides a fun and dynamic visualization of random outcomes.

## ✨ Features

*   **Animated Marble Race**: Watch marbles race to the finish line with smooth animations.
*   **Random Number Generation**: The race outcomes are driven by random numbers, showcasing their application in a game context.
*   **Interactive Visualization**: A compelling way to visualize probabilistic events.
*   **Modern Web Stack**: Leverages Astro for fast content delivery and Phaser for game rendering.

## 🚀 Project Structure

*   `public/`: Contains static assets like images (`marble.png`).
*   `src/components/`: Houses Astro/React components, including `MarbleRace.tsx` which integrates the Phaser game.
*   `src/constants/`: Defines game-related constants.
*   `src/pages/`: Astro pages, with `index.astro` serving as the main entry point.
*   `src/phaser/`: Contains Phaser game logic, including `gameConfig.ts` and `RaceScene.ts`.
*   `src/styles/`: Stores styling information for the application.
*   `src/utils/`: Utility functions, potentially including mathematical or random number generation helpers.

## 🛠️ Technologies Used

*   [Astro](https://astro.build/): A modern static site builder for fast content-focused websites.
*   [Phaser](https://phaser.io/): A fast, free, and fun open-source HTML5 game framework.
*   [React](https://react.dev/): Used for building interactive UI components within Astro.
*   [TypeScript](https://www.typescriptlang.org/): For type-safe JavaScript development.
*   [Bun](https://bun.sh/): A fast all-in-one JavaScript runtime, bundler, transpiler, and package manager.

## 🏁 Getting Started

To get this project up and running on your local machine, follow these steps:

### Prerequisites

Ensure you have [Bun](https://bun.sh/docs/installation) installed.

### Installation

1.  Clone the repository:
    ```sh
    git clone https://github.com/jaroslaw-weber/animated-random-number-generator.git
    cd animated-random-number-generator
    ```
2.  Install dependencies:
    ```sh
    bun install
    ```

### Running the Development Server

To start the local development server:

```sh
bun dev
```

This will start the server at `localhost:4321`. Open your browser and navigate to this address to see the application in action.

## 📦 Building for Production

To build the project for production:

```sh
bun build
```

This command will compile your project into static assets in the `./dist/` directory.

## 🔍 Previewing the Production Build

You can preview your production build locally before deploying:

```sh
bun preview
```

## ⚙️ Other Commands

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `bun astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `bun astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [Astro's documentation](https://docs.astro.build) or jump into their [Discord server](https://astro.build/chat).
