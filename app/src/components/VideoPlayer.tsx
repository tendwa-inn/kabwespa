import React from "react";
import { StyleSheet } from "react-native";
import WebView from "react-native-webview";

export default function VideoPlayer({ embedUrl }: { embedUrl: string }) {
  return (
    <WebView
      source={{ uri: embedUrl }}
      style={styles.player}
      allowsFullscreenVideo
      mediaPlaybackRequiresUserAction={false}
    />
  );
}

const styles = StyleSheet.create({
  player: { flex: 1, backgroundColor: "black" },
});
