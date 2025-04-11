import { StyleSheet, View, Text } from "react-native";
import * as Application from "expo-application";
import { useEffect, useState } from "react";

export default function AppInfoScreen() {
  const [appInfo, setAppInfo] = useState({
    appName: "Loading...",
    bundleId: "Loading...",
    version: "Loading...",
    buildNumber: "Loading...",
  });

  useEffect(() => {
    async function loadAppInfo() {
      const name = Application.applicationName;
      const bundleId = Application.applicationId;
      const version = Application.nativeApplicationVersion;
      const buildNumber = Application.nativeBuildVersion;

      setAppInfo({
        appName: name || "Unknown",
        bundleId: bundleId || "Unknown",
        version: version || "Unknown",
        buildNumber: buildNumber || "Unknown",
      });
    }

    loadAppInfo();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{appInfo.appName}</Text>
      <Text style={styles.info}>Bundle ID: {appInfo.bundleId}</Text>
      <Text style={styles.info}>Version: {appInfo.version}</Text>
      <Text style={styles.info}>Build: {appInfo.buildNumber}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  info: {
    fontSize: 16,
    marginBottom: 10,
  },
});
