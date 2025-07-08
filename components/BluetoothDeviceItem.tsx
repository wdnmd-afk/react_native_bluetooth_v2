import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BluetoothDevice } from '../hooks/useBluetooth';

interface BluetoothDeviceItemProps {
  device: BluetoothDevice;
  onConnect: (device: BluetoothDevice) => void;
  disabled?: boolean;
}

const BluetoothDeviceItem: React.FC<BluetoothDeviceItemProps> = ({
  device,
  onConnect,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      style={styles.deviceItem}
      onPress={() => onConnect(device)}
      disabled={disabled}>
      <View style={styles.deviceInfo}>
        <Text style={styles.deviceName}>{device.name || '未知设备'}</Text>
        <Text style={styles.deviceId}>ID: {device.id}</Text>
        {device.rssi && (
          <Text style={styles.deviceRssi}>信号强度: {device.rssi} dBm</Text>
        )}
      </View>
      <View style={styles.connectButton}>
        <Text style={styles.connectButtonIcon}>🔗</Text>
        <Text style={styles.connectButtonText}>连接</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 15,
    marginBottom: 10,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3f51b5',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  deviceId: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  deviceRssi: {
    fontSize: 12,
    color: '#888',
  },
  connectButton: {
    backgroundColor: '#3f51b5',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectButtonIcon: {
    fontSize: 14,
    marginRight: 5,
  },
  connectButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default BluetoothDeviceItem;