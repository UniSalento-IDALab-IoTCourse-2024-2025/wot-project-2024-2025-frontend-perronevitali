import { BleManager } from 'react-native-ble-plx';

let _manager: BleManager | null = null;

export function getBleManager(): BleManager {
  if (!_manager) {
    _manager = new BleManager();
  }
  return _manager;
}

export function destroyBleManager() {
  if (_manager) {
    _manager.destroy();
    _manager = null;
  }
}