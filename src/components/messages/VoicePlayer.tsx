import { useEffect } from "react";
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { colors } from "@/constants/theme";

let stopActivePlayer: (() => void) | null = null;

const formatSec = (sec: number) => {
  const total = Math.max(0, Math.floor(sec));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
};

type Props = {
  url: string;
  durationSec?: number;
  mine: boolean;
  pending?: boolean;
};

export default function VoicePlayer({ url, durationSec, mine, pending }: Props) {
  const player = useAudioPlayer(pending ? null : url, { updateInterval: 150 });
  const status = useAudioPlayerStatus(player);

  const playing = !!status.playing;
  const total = status.duration > 0 ? status.duration : durationSec ?? 0;
  const current = playing || status.currentTime > 0 ? status.currentTime : 0;
  const progress = total > 0 ? Math.min(1, Math.max(0, current / total)) : 0;

  useEffect(() => {
    const pauseSelf = () => {
      try {
        player.pause();
      } catch {
        // chiqishda xato bo'lsa e'tiborsiz qoldiramiz
      }
    };
    return () => {
      if (stopActivePlayer === pauseSelf) stopActivePlayer = null;
    };
  }, [player]);

  const toggle = async () => {
    if (pending || !url) return;
    if (playing) {
      player.pause();
      return;
    }

    if (stopActivePlayer) stopActivePlayer();
    const pauseSelf = () => {
      try {
        player.pause();
      } catch {
        // chiqishda xato bo'lsa e'tiborsiz qoldiramiz
      }
    };
    stopActivePlayer = pauseSelf;

    await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }).catch(() => {});
    if (status.didJustFinish || (status.duration > 0 && status.currentTime >= status.duration - 0.1)) {
      await player.seekTo(0).catch(() => {});
    }
    player.play();
  };

  const fg = mine ? colors.white : colors.text;
  const muted = mine ? "rgba(255,255,255,0.75)" : colors.muted;
  const trackBg = mine ? "rgba(255,255,255,0.28)" : colors.border;
  const trackFill = mine ? colors.white : colors.primary;
  const btnBg = mine ? "rgba(255,255,255,0.22)" : colors.primary;

  return (
    <View style={styles.wrap}>
      <Pressable
        style={[styles.playBtn, { backgroundColor: btnBg }]}
        onPress={toggle}
        disabled={pending}
        hitSlop={6}
      >
        {pending ? (
          <ActivityIndicator size="small" color={colors.white} />
        ) : (
          <Ionicons
            name={playing ? "pause" : "play"}
            size={18}
            color={colors.white}
            style={!playing ? { marginLeft: 2 } : undefined}
          />
        )}
      </Pressable>

      <View style={styles.trackCol}>
        <View style={[styles.track, { backgroundColor: trackBg }]}>
          <View style={[styles.fill, { width: `${progress * 100}%`, backgroundColor: trackFill }]} />
        </View>
        <View style={styles.metaRow}>
          <Text style={[styles.dur, { color: muted }]}>
            {formatSec(playing ? current : total)}
          </Text>
          <Ionicons name="mic-outline" size={12} color={fg} style={{ opacity: 0.7 }} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", gap: 10, minWidth: 190, paddingVertical: 2 },
  playBtn: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: "center", justifyContent: "center",
  },
  trackCol: { flex: 1, gap: 6 },
  track: { height: 4, borderRadius: 2, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 2 },
  metaRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  dur: { fontSize: 11, fontWeight: "700" },
});
