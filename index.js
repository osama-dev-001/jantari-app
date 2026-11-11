import { AppRegistry, LogBox } from 'react-native';
import { registerWidgetTaskHandler } from 'react-native-android-widget';
import App from './App';
import { name as appName } from './app.json';
import { widgetTaskHandler } from './src/widget/taskHandler';

// Raised inside @react-navigation/stack on RN 0.85, not by app code; the
// dev toast it triggers covers the tab bar.
LogBox.ignoreLogs(['InteractionManager has been deprecated']);

AppRegistry.registerComponent(appName, () => App);
registerWidgetTaskHandler(widgetTaskHandler);
