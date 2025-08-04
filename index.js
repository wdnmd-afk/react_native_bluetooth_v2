/**
 * @format
 */

// 必须在最顶部导入gesture-handler，这是官方要求
import 'react-native-gesture-handler';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
