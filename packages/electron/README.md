# @random-number-animation/electron

The desktop application version of the animated random number generator, built with Electron. This package provides a native desktop experience for Windows, macOS, and Linux.

## 📦 Installation

This package is part of the monorepo workspace. Install dependencies from the root:

```sh
bun install
```

## 🚀 Running the Application

### Development Mode

```sh
cd packages/electron
bun run dev
```

This will:
1. Compile TypeScript files
2. Start the Electron application
3. Open the desktop window with the marble race

### Production Build

```sh
cd packages/electron
bun run build
bun run start
```

## 🏗️ Architecture

### Main Process (`src/main.ts`)

The main Electron process that:
- Creates the application window
- Handles window lifecycle events
- Manages application menu and system integration

### Renderer Process (`src/renderer/`)

The frontend React application that:
- Renders the UI using React components
- Integrates with the core package components
- Provides navigation between race and configuration views

## 🎮 Features

- **Native Desktop App**: Cross-platform desktop application
- **Same Features as Web**: Full feature parity with web version
- **Offline Operation**: Works without internet connection
- **System Integration**: Native window management and menus
- **Auto Updates**: Support for automatic updates (can be added)

## 🔧 Development

### Project Structure

```
packages/electron/
├── src/
│   ├── main.ts              # Electron main process
│   └── renderer/
│       ├── app.tsx          # React renderer entry point
│       └── index.html       # HTML template
├── package.json             # Electron-specific dependencies
├── tsconfig.json            # TypeScript configuration
└── README.md                # This file
```

### Building from Source

1. Ensure all dependencies are installed
2. Build the core package first:
   ```sh
   cd packages/core
   bun run build
   ```
3. Build and run the electron app:
   ```sh
   cd packages/electron
   bun run build
   bun run start
   ```

## 📋 Configuration

The application uses the same configuration system as the core package. Settings are stored locally and persist between sessions.

### Window Configuration

Default window settings in `main.ts`:
- Width: 800px
- Height: 600px
- Web preferences: Node integration enabled

## 🔗 Dependencies

- **Electron 30+** - Desktop application framework
- **React 19+** - UI framework
- **Phaser 3.90+** - Game engine
- **`@random-number-animation/core`** - Shared components

## 🖥️ Supported Platforms

- **Windows** (x64, ia32, arm64)
- **macOS** (x64, arm64)
- **Linux** (x64, arm64)

## 📦 Distribution

To create distributable packages:

1. Install electron-builder:
   ```sh
   bun add -D electron-builder
   ```

2. Add build scripts to package.json:
   ```json
   {
     "scripts": {
       "dist": "electron-builder"
     }
   }
   ```

3. Build distributables:
   ```sh
   bun run dist
   ```

## 🐛 Troubleshooting

### Common Issues

**App won't start:**
- Ensure core package is built: `cd packages/core && bun run build`
- Check that all dependencies are installed

**Phaser not loading:**
- Verify that renderer process has proper web preferences
- Check console for Phaser-related errors

**Window sizing issues:**
- Adjust window dimensions in `main.ts`
- Ensure responsive design in components

## 📝 License

MIT License - see root package for details.