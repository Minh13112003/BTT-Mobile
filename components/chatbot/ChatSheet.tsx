import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  FlatList,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ChatbotLogo from "@/components/chatbot/ChatbotLogo";
import ChatMessageBubble from "@/components/chatbot/ChatMessageBubble";
import { FONT_SIZE } from "@/constants/typography";
import { CHAT_STARTER_CHIPS, ChatMessage, useChatbot } from "@/context/Chatbot_Context";
import { useTheme } from "@/context/Theme_Context";
import type { ChatTour, ChatBooking } from "@/services/chatbot";

const SHEET_TOP = 92;
const MAX_INPUT_HEIGHT = 4 * 24 + 22;

function TypingRow({ isDark }: { isDark: boolean }) {
  const dots = useRef([0, 1, 2].map(() => new Animated.Value(0.3))).current;

  useEffect(() => {
    const loops = dots.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 160),
          Animated.timing(v, { toValue: 1, duration: 320, useNativeDriver: true }),
          Animated.timing(v, { toValue: 0.3, duration: 320, useNativeDriver: true }),
          Animated.delay((2 - i) * 160),
        ]),
      ),
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [dots]);

  return (
    <View
      style={{
        alignSelf: "flex-start",
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingHorizontal: 14,
        paddingVertical: 11,
        borderRadius: 18,
        borderBottomLeftRadius: 6,
        backgroundColor: isDark ? "#1E222B" : "#FFFFFF",
        borderWidth: 1,
        borderColor: isDark ? "#2D3342" : "#ECEEF3",
      }}
    >
      <Text style={{ fontSize: FONT_SIZE.xxs, fontStyle: "italic", color: isDark ? "#9AA1B2" : "#6B6F7B" }}>
        bttAI đang soạn câu trả lời
      </Text>
      <View style={{ flexDirection: "row", gap: 4 }}>
        {dots.map((v, i) => (
          <Animated.View
            key={i}
            style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: "#8A8E9A", opacity: v }}
          />
        ))}
      </View>
    </View>
  );
}

function HeaderButton({
  icon,
  label,
  onPress,
  isDark,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  isDark: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityLabel={label}
      activeOpacity={0.7}
      style={{
        width: 38,
        height: 38,
        borderRadius: 19,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: isDark ? "#2A2E38" : "#F1F2F6",
      }}
    >
      <Ionicons name={icon} size={20} color={isDark ? "#C8CDD9" : "#4B4F5C"} />
    </TouchableOpacity>
  );
}

interface Props {
  onTourPress: (tour: ChatTour) => void;
  onOpenBooking: (booking: ChatBooking) => void;
}

export default function ChatSheet({ onTourPress, onOpenBooking }: Props) {
  const { messages, sheetVisible, isSending, send, sendAction, retry, minimize, close } = useChatbot();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();

  const [rendered, setRendered] = useState(false);
  const [draft, setDraft] = useState("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const progress = useRef(new Animated.Value(0)).current;
  const listRef = useRef<FlatList<ChatMessage>>(null);

  // Mở / thu nhỏ / đóng: trượt lên-xuống, chỉ gỡ khỏi cây khi trượt xong.
  useEffect(() => {
    if (sheetVisible) {
      setRendered(true);
      Animated.timing(progress, {
        toValue: 1,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      Keyboard.dismiss();
      Animated.timing(progress, {
        toValue: 0,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setRendered(false);
      });
    }
  }, [sheetVisible, progress]);

  useEffect(() => {
    const showEvt = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvt = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSub = Keyboard.addListener(showEvt, (e) => setKeyboardHeight(e.endCoordinates.height));
    const hideSub = Keyboard.addListener(hideEvt, () => setKeyboardHeight(0));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  if (!rendered) return null;

  const lastMessage = messages[messages.length - 1];
  const hasUserMessage = messages.some((m) => m.role === "user");
  const chips: string[] = !hasUserMessage
    ? CHAT_STARTER_CHIPS
    : !isSending && lastMessage?.role === "bot" && lastMessage.goiY?.length
      ? lastMessage.goiY
      : [];

  const canSend = draft.trim().length > 0 && !isSending;
  const handleSend = (value?: string) => {
    const text = (value ?? draft).trim();
    if (!text || isSending) return;
    setDraft("");
    send(text);
  };

  const sheetBg = isDark ? "#111318" : "#F5F6FA";
  const headerBg = isDark ? "#1A1D25" : "#FFFFFF";
  const line = isDark ? "#2D3342" : "#E8EAF0";

  return (
    <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }}>
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: isDark ? "rgba(0,0,0,0.55)" : "rgba(26,26,46,0.5)",
          opacity: progress,
        }}
      >
        <Pressable style={{ flex: 1 }} onPress={minimize} accessibilityLabel="Thu nhỏ khung chat" />
      </Animated.View>

      <Animated.View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          top: SHEET_TOP,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          overflow: "hidden",
          backgroundColor: sheetBg,
          transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [windowHeight, 0] }) }],
          paddingBottom: keyboardHeight > 0 ? keyboardHeight : insets.bottom,
        }}
      >
        <View style={{ alignItems: "center", paddingTop: 8, paddingBottom: 2, backgroundColor: headerBg }}>
          <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: isDark ? "#3A4050" : "#D3D6DF" }} />
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: 12,
            borderBottomWidth: 1,
            borderBottomColor: line,
            backgroundColor: headerBg,
          }}
        >
          <ChatbotLogo size={40} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontSize: FONT_SIZE.md, fontWeight: "800", color: isDark ? "#F5F6FA" : "#1A1A2E" }}>
              bttAI
            </Text>
            <Text
              numberOfLines={1}
              style={{ fontSize: FONT_SIZE.xxs, fontWeight: "600", color: isDark ? "#4CC27E" : "#1C8A4C" }}
            >
              Trợ lý tour BenThanh Tourist
            </Text>
          </View>
          <HeaderButton icon="chevron-down" label="Thu nhỏ" onPress={minimize} isDark={isDark} />
          <HeaderButton icon="close" label="Đóng" onPress={close} isDark={isDark} />
        </View>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 14, paddingTop: 14, paddingBottom: 6, gap: 10 }}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item, index }) => (
            <ChatMessageBubble
              message={item}
              isDark={isDark}
              onTourPress={onTourPress}
              onRetry={retry}
              canRetry={index === messages.length - 1 && !isSending}
              onAction={sendAction}
              onOpenBooking={onOpenBooking}
              canAct={index === messages.length - 1 && !isSending}
            />
          )}
          ListFooterComponent={isSending ? <TypingRow isDark={isDark} /> : null}
        />

        {chips.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            style={{ flexGrow: 0 }}
            contentContainerStyle={{ gap: 8, paddingHorizontal: 14, paddingTop: 6, paddingBottom: 10 }}
          >
            {chips.map((chip) => (
              <TouchableOpacity
                key={chip}
                activeOpacity={0.8}
                onPress={() => handleSend(chip)}
                style={{
                  height: 38,
                  paddingHorizontal: 14,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: isDark ? "#4A2A30" : "#F0C4C9",
                  backgroundColor: isDark ? "#1E222B" : "#FFFFFF",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: FONT_SIZE.xxs, fontWeight: "600", color: isDark ? "#FF8A93" : "#B30118" }}>
                  {chip}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View
          style={{
            paddingHorizontal: 14,
            paddingTop: 10,
            paddingBottom: 6,
            backgroundColor: headerBg,
            borderTopWidth: 1,
            borderTopColor: line,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 10 }}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Nhập câu hỏi về tour…"
              placeholderTextColor={isDark ? "#8A92A6" : "#8A8E9A"}
              multiline
              editable={!isSending}
              blurOnSubmit={false}
              style={{
                flex: 1,
                minHeight: 46,
                maxHeight: MAX_INPUT_HEIGHT,
                paddingHorizontal: 16,
                paddingTop: Platform.OS === "ios" ? 12 : 10,
                paddingBottom: Platform.OS === "ios" ? 12 : 10,
                borderRadius: 23,
                fontSize: FONT_SIZE.xxs,
                lineHeight: 24,
                color: isDark ? "#E8EAF0" : "#1A1A2E",
                backgroundColor: isDark ? "#2A2E38" : "#F1F2F6",
              }}
            />
            <TouchableOpacity
              onPress={() => handleSend()}
              disabled={!canSend}
              activeOpacity={0.85}
              accessibilityLabel="Gửi"
              style={{ opacity: canSend ? 1 : 0.45 }}
            >
              <LinearGradient
                colors={isDark ? ["#C21E2E", "#7A0A16"] : ["#F0323F", "#B8001A"]}
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 23,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="send" size={20} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
          <Text
            style={{
              textAlign: "center",
              fontSize: FONT_SIZE.xxs,
              color: isDark ? "#8A92A6" : "#8A8E9A",
              paddingTop: 8,
              paddingBottom: 6,
            }}
          >
            Gõ <Text style={{ fontWeight: "700", color: isDark ? "#C8CDD9" : "#6B6F7B" }}>/clear</Text> để làm mới cuộc
            trò chuyện
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}
