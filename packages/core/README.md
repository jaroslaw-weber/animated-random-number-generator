# @random-number-animation/core

The core package containing shared React components and Phaser game logic for the animated random number generator. This package provides the main `MarbleRace` component and supporting utilities.

## 📦 Installation

This package is part of the monorepo workspace. Install dependencies from the root:

```sh
bun install
```

## 🚀 Usage

### MarbleRace Component

The main component that renders the animated marble race:

```tsx
import { MarbleRace } from '@random-number-animation/core';

function App() {
  return <MarbleRace />;
}
```

### Configuration Components

```tsx
import { ConfigForm, ModeSwitcher, NameListConfig, NumberRangeConfig } from '@random-number-animation/core';

function ConfigPage() {
  return (
    <div>
      <ModeSwitcher />
      <ConfigForm />
      <NumberRangeConfig />
      <NameListConfig />
    </div>
  );
}
```

### Game Configuration

```tsx
import { getGameConfig } from '@random-number-animation/core';

const config = getGameConfig();
// Returns current game settings
```

## 🏗️ Architecture

### Components

- **`MarbleRace`** - Main React wrapper for the Phaser game
- **`ConfigForm`** - Form for configuring game settings
- **`ModeSwitcher`** - Toggle between number range and name list modes
- **`NameListConfig`** - Configure custom name lists
- **`NumberRangeConfig`** - Configure number ranges

### Phaser Integration

- **`RaceScene`** - Main Phaser scene handling game logic
- **`gameConfig`** - Phaser game configuration
- Game objects: `Marbles`, `Pegs`, `Bumpers`, `Walls`, `Slides`

### Utilities

- **`configLoader`** - Load and save game configuration
- **`math`** - Mathematical utilities (clamping, etc.)
- **`game.ts`** - Game constants and settings

## 🎮 Game Features

- **Animated Marble Race**: Smooth Phaser animations
- **Random Number Generation**: True random outcomes
- **No Repeats Mode**: Elimination-style racing
- **Configurable Parameters**: Number ranges, names, physics settings
- **Winner Detection**: Automatic winner announcement

## 🔧 Development

### Building

```sh
cd packages/core
bun run build
```

### Development Mode

```sh
cd packages/core
bun run dev
```

## 📋 API Reference

### MarbleRace Props

The `MarbleRace` component accepts no props and manages its own state internally.

### Game Configuration

```typescript
interface GameConfig {
  mode: 'numberRange' | 'nameList';
  numberRange: {
    min: number;
    max: number;
  };
  nameList: string[];
  physics: {
    gravity: number;
    bounce: number;
  };
}
```

## 🎨 Styling

The package includes default styles in `raceStyles.ts`. You can override these by providing your own CSS or modifying the style objects.

## 🔗 Dependencies

- React 19+
- Phaser 3.90+
- TypeScript 5+

## 📝 License

MIT License - see root package for details.