import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BluetoothState, getBluetoothStateText } from '../hooks/useBluetooth';

interface BluetoothStatusProps {
  bluetoothState: BluetoothState;
  isBluetoothEnabled: boolean;
  hasLocationPermission: boolean;
  hasBluetoothPermission: boolean;
}

const BluetoothStatus: React.FC<BluetoothStatusProps> = ({
  bluetoothState,
  isBluetoothEnabled,
  hasLocationPermission,
  hasBluetoothPermission,
}) => {
  return (
    <View style={styles.statusSection}>
      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>蓝牙状态:</Text>
        <Text
          style={[
            styles.statusValue,
            {color: isBluetoothEnabled ? '#4caf50' : '#f44336'},
          ]}>
          {getBluetoothStateText(bluetoothState)}
        </Text>
      </View>

      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>定位权限:</Text>
        <Text
          style={[
            styles.statusValue,
            {color: hasLocationPermission ? '#4caf50' : '#f44336'},
          ]}>
          {hasLocationPermission ? '已授权' : '未授权'}
        </Text>
      </View>

      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>蓝牙权限:</Text>
        <Text
          style={[
            styles.statusValue,
            {color: hasBluetoothPermission ? '#4caf50' : '#f44336'},
          ]}>
          {hasBluetoothPermission ? '已授权' : '未授权'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statusSection: {
    backgroundColor: '#ffffff',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BluetoothStatus;