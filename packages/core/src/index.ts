// Export all components
export { ConfigForm } from './components/ConfigForm';
export { default as MarbleRace } from './components/MarbleRace';
export { ModeSwitcher } from './components/ModeSwitcher';
export { NameListConfig } from './components/NameListConfig';
export { NumberRangeConfig } from './components/NumberRangeConfig';

// Export utilities and constants if needed
export * from './constants/game';
export * from './utils/configLoader';
export * from './utils/math';
export * from './styles/raceStyles';

// Export Phaser related if needed
export * from './phaser/gameConfig';
export { RaceScene } from './phaser/RaceScene';