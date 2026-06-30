import { NativeModule, requireNativeModule } from 'expo-modules-core';
import { PeripheralFoundEvent, ScanErrorEvent } from './BeaconNativeScanner.types';

declare class BeaconNativeScannerModule extends NativeModule<{
  onPeripheralFound: (event: PeripheralFoundEvent) => void;
  onScanError: (event: ScanErrorEvent) => void;
}> {
  startScan(): void;
  stopScan(): void;
}

export default requireNativeModule<BeaconNativeScannerModule>('BeaconNativeScanner');