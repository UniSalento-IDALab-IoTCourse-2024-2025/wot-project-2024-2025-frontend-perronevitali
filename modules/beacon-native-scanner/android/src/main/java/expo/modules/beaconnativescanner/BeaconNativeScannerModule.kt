package expo.modules.beaconnativescanner

import android.bluetooth.BluetoothManager
import android.bluetooth.le.BluetoothLeScanner
import android.bluetooth.le.ScanCallback
import android.bluetooth.le.ScanResult
import android.bluetooth.le.ScanSettings
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class BeaconNativeScannerModule : Module() {
  private var scanner: BluetoothLeScanner? = null
  private var scanCallback: ScanCallback? = null

  override fun definition() = ModuleDefinition {
    Name("BeaconNativeScanner")

    Events("onPeripheralFound", "onScanError")

    Function("startScan") {
      startScanInternal()
    }

    Function("stopScan") {
      stopScanInternal()
    }
  }

  private fun startScanInternal() {
    val context = appContext.reactContext
    if (context == null) {
      sendEvent("onScanError", mapOf("message" to "reactContext non disponibile"))
      return
    }

    val bluetoothManager = context.getSystemService(BluetoothManager::class.java)
    val adapter = bluetoothManager?.adapter

    if (adapter == null || !adapter.isEnabled) {
      sendEvent("onScanError", mapOf("message" to "Bluetooth non disponibile o spento"))
      return
    }

    scanner = adapter.bluetoothLeScanner
    if (scanner == null) {
      sendEvent("onScanError", mapOf("message" to "BluetoothLeScanner null"))
      return
    }

    val settings = ScanSettings.Builder()
      .setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY)
      .build()

    scanCallback = object : ScanCallback() {
      override fun onScanResult(callbackType: Int, result: ScanResult) {
        val address = result.device?.address ?: "unknown"
        val bytes = result.scanRecord?.bytes
        val hex = bytes?.joinToString("") { "%02x".format(it) } ?: ""
        val hasEddystone = hex.contains("16aafe")

        sendEvent(
          "onPeripheralFound",
          mapOf(
            "id" to address,
            "rssi" to result.rssi,
            "rawHex" to hex,
            "hasEddystone" to hasEddystone
          )
        )
      }

      override fun onScanFailed(errorCode: Int) {
        sendEvent("onScanError", mapOf("message" to "Scan fallito, codice: $errorCode"))
      }
    }

    scanner?.startScan(null, settings, scanCallback)
  }

  private fun stopScanInternal() {
    scanCallback?.let { scanner?.stopScan(it) }
    scanCallback = null
  }
}