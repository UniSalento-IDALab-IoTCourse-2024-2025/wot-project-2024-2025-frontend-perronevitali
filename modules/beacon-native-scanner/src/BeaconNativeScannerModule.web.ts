export default {
  startScan: () => console.warn('BeaconNativeScanner non supportato su web'),
  stopScan: () => {},
  addListener: () => ({ remove: () => {} }),
  removeAllListeners: () => {},
};