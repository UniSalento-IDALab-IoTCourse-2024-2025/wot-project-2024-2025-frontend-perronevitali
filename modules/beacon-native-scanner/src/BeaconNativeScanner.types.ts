export type PeripheralFoundEvent = {
  id: string;
  rssi: number;
  rawHex: string;
  hasEddystone: boolean;
};

export type ScanErrorEvent = {
  message: string;
};