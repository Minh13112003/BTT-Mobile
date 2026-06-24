import { getPalette } from "@/constants/theme";
import { useTheme } from "@/context/Theme_Context";
import { getNewsById, NewsItem } from "@/services/news";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState, useRef } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import RenderHTML from "react-native-render-html";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GestureViewer } from "react-native-gesture-image-viewer";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const CATEGORY_LABEL: Record<string, string> = {
  company: "Công ty",
  promotion: "Khuyến mãi",
  destination: "Điểm đến",
  other: "Khác",
};

const cleanTextForVietnamese = (text: string): string => {
  if (!text) return "";
  return text
    .replace(/\u00ad/g, "")
    .replace(/\u200b/g, "")
    .replace(/&shy;/g, "")
    .replace(/&#173;/g, "")
    .replace(/&#8203;/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/<p>\s*<\/p>/g, "")
    .replace(/<p><br\s*\/?><\/p>/g, "")
    .replace(/text-align\s*:\s*justify/gi, "text-align: left")
    .replace(/align\s*=\s*["']?justify["']?/gi, 'align="left"');
};

export default function NewsDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const palette = getPalette(isDark);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();


  const scrollViewRef = useRef<ScrollView>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const [item, setItem] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [zoomImageUrl, setZoomImageUrl] = useState<string | null>(null);

  const handleCloseModal = () => {
    setZoomImageUrl(null);
  };

  useEffect(() => {
    if (!id) return;
    getNewsById(id)
      .then((res) => setItem(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  // Custom image renderer for HTML contents to make them zoomable on click
  const renderers = {
    img: (props: any) => {
      const src = props.tnode.attributes.src;
      return (
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={() => setZoomImageUrl(src)}
          style={{ marginVertical: 12, borderRadius: 8, overflow: "hidden" }}
        >
          <Image
            source={{ uri: src }}
            style={{ width: "100%", height: 220 }}
            resizeMode="cover"
          />
        </TouchableOpacity>
      );
    },
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.screenBg }}>
      <StatusBar
        style="light"
        backgroundColor={isDark ? "#1E222B" : "#D0021B"}
      />

      {/* Header */}
      <View
        style={{
          backgroundColor: isDark ? "#1E222B" : "#D0021B",
          paddingTop: insets.top,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 13,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: "rgba(255,255,255,0.15)",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 16,
              fontWeight: "700",
              flex: 1,
            }}
            numberOfLines={1}
          >
            {item?.title ?? "Chi tiết tin tức"}
          </Text>
        </View>
      </View>

      <LinearGradient colors={palette.gradient} style={{ flex: 1 }}>
        {loading ? (
          <View
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <ActivityIndicator size="large" color={palette.spinner} />
          </View>
        ) : !item ? (
          <View
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <Text style={{ fontSize: 40 }}>😕</Text>
            <Text
              style={{
                marginTop: 12,
                fontSize: 16,
                fontWeight: "700",
                color: isDark ? "#94A3B8" : "#64748B",
              }}
            >
              Không tìm thấy bài viết
            </Text>
          </View>
        ) : (
          <ScrollView
            ref={scrollViewRef}
            scrollEventThrottle={16}
            onScroll={(event) => {
              const offsetY = event.nativeEvent.contentOffset.y;
              setShowBackToTop(offsetY > 300);
            }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            {/* Cover image */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setZoomImageUrl(item.imageUrl)}
            >
              <Image
                source={{ uri: item.imageUrl }}
                style={{ width: "100%", height: 220 }}
                resizeMode="cover"
              />
            </TouchableOpacity>

            <View style={{ padding: 20 }}>
              {/* Category badge + date */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 12,
                  gap: 8,
                }}
              >
                <View
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 99,
                    backgroundColor: isDark ? "#2D1B1B" : "#FFF1F2",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "700",
                      color: "#D0021B",
                    }}
                  >
                    {CATEGORY_LABEL[item.category] ?? "Tin tức"}
                  </Text>
                </View>
                <Text
                  style={{ fontSize: 13, color: "#94A3B8", fontWeight: "600" }}
                >
                  📅 {item.date}
                </Text>
              </View>

              {/* Title */}
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "800",
                  color: isDark ? "#F8FAFC" : "#0F172A",
                  lineHeight: 30,
                  marginBottom: 14,
                }}
              >
                {item.title}
              </Text>

              {/* Sapo / Lead text */}
              {!!item.excerpt && (
                <View
                  style={{
                    padding: 14,
                    borderRadius: 10,
                    backgroundColor: isDark ? "#281D1D" : "#FFF5F5",
                    borderLeftWidth: 4,
                    borderLeftColor: "#D0021B",
                    marginBottom: 20,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      fontStyle: "italic",
                      color: isDark ? "#FDA4AF" : "#9F1239",
                      lineHeight: 22,
                    }}
                  >
                    {item.excerpt}
                  </Text>
                </View>
              )}

              {/* Divider */}
              <View
                style={{
                  height: 1,
                  backgroundColor: isDark ? "#334155" : "#E2E8F0",
                  marginBottom: 18,
                }}
              />

              <View>
                {/<\/?[a-z][\s\S]*>/i.test(item.content || "") ? (
                  <RenderHTML
                    contentWidth={width - 40}
                    source={{
                      html: cleanTextForVietnamese(item.content || ""),
                    }}
                    baseStyle={{
                      color: isDark ? "#CBD5E1" : "#334155",
                      fontSize: 15,
                    }}
                    defaultTextProps={{
                      textBreakStrategy: "simple",
                      allowFontScaling: false,
                    }}
                    classesStyles={{
                      "ql-align-center": {
                        textAlign: "center",
                        alignItems: "center",
                        justifyContent: "center",
                      },
                    }}
                    renderers={renderers}
                    tagsStyles={{
                      p: {
                        margin: 0,
                        marginTop: 0,
                        marginBottom: 14,
                        fontSize: 15,
                        color: isDark ? "#CBD5E1" : "#334155",
                        lineHeight: 24,
                        textAlign: "left",
                      },
                      strong: {
                        fontWeight: "700",
                        color: isDark ? "#F8FAFC" : "#0F172A",
                      },
                      img: {
                        marginVertical: 12,
                        borderRadius: 8,
                        alignSelf: "center",
                      },
                      figure: {
                        margin: 0,
                        marginVertical: 12,
                        alignItems: "center",
                      },
                      figcaption: {
                        textAlign: "center",
                        fontSize: 13,
                        fontStyle: "italic",
                        color: isDark ? "#94A3B8" : "#64748B",
                        marginTop: 6,
                        lineHeight: 18,
                      },
                      h1: {
                        margin: 0,
                        fontSize: 20,
                        fontWeight: "bold",
                        marginVertical: 10,
                        color: isDark ? "#F8FAFC" : "#0F172A",
                      },
                      h2: {
                        margin: 0,
                        fontSize: 18,
                        fontWeight: "bold",
                        marginVertical: 8,
                        color: isDark ? "#F8FAFC" : "#0F172A",
                      },
                      h3: {
                        margin: 0,
                        fontSize: 16,
                        fontWeight: "bold",
                        marginVertical: 6,
                        color: isDark ? "#F8FAFC" : "#0F172A",
                      },
                      ul: { margin: 0, marginVertical: 8, paddingLeft: 16 },
                      ol: { margin: 0, marginVertical: 8, paddingLeft: 16 },
                      li: {
                        margin: 0,
                        fontSize: 15,
                        color: isDark ? "#CBD5E1" : "#334155",
                        lineHeight: 22,
                        marginBottom: 6,
                        textAlign: "left",
                      },
                    }}
                  />
                ) : (
                  (item.content || "").split(/\n+/).map((p, index) => {
                    const trimmed = p.trim();
                    if (!trimmed) return null;

                    const isBullet =
                      trimmed.startsWith("-") ||
                      trimmed.startsWith("*") ||
                      trimmed.startsWith("•");

                    if (isBullet) {
                      const cleanText = trimmed.replace(/^[-*•]\s*/, "");
                      return (
                        <View
                          key={index}
                          style={{
                            flexDirection: "row",
                            marginBottom: 10,
                            paddingLeft: 8,
                            paddingRight: 4,
                          }}
                        >
                          <Text
                            style={{
                              color: "#D0021B",
                              marginRight: 8,
                              fontSize: 16,
                            }}
                          >
                            •
                          </Text>
                          <Text
                            textBreakStrategy="simple"
                            style={{
                              flex: 1,
                              fontSize: 15,
                              color: isDark ? "#CBD5E1" : "#334155",
                              lineHeight: 24,
                              textAlign: "left",
                            }}
                          >
                            {cleanTextForVietnamese(cleanText)}
                          </Text>
                        </View>
                      );
                    }

                    return (
                      <Text
                        key={index}
                        textBreakStrategy="simple"
                        style={{
                          fontSize: 15,
                          color: isDark ? "#CBD5E1" : "#334155",
                          lineHeight: 24,
                          marginBottom: 14,
                          textAlign: "left",
                        }}
                      >
                        {cleanTextForVietnamese(trimmed)}
                      </Text>
                    );
                  })
                )}
              </View>
            </View>
          </ScrollView>
        )}
      </LinearGradient>

      {/* Image Zoom Modal */}
      <Modal
        visible={zoomImageUrl !== null}
        transparent={true}
        onRequestClose={handleCloseModal}
        animationType="fade"
      >
        <GestureHandlerRootView style={{ flex: 1 }}>
          <View style={{ flex: 1, backgroundColor: "black" }}>
            {zoomImageUrl && (
              <GestureViewer
                data={[zoomImageUrl]}
                ListComponent={ScrollView}
                onDismiss={handleCloseModal}
                renderItem={(item) => (
                  <Image
                    source={{ uri: item }}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="contain"
                  />
                )}
              />
            )}

            {/* Close Button */}
            <TouchableOpacity
              onPress={handleCloseModal}
              style={{
                position: "absolute",
                top: insets.top + 10,
                right: 20,
                zIndex: 10,
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: "rgba(255,255,255,0.2)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </GestureHandlerRootView>
      </Modal>

      {/* Back to Top Button */}
      {showBackToTop && (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            scrollViewRef.current?.scrollTo({ y: 0, animated: true });
          }}
          style={{
            position: "absolute",
            bottom: 30,
            right: 20,
            width: 46,
            height: 46,
            borderRadius: 23,
            backgroundColor: "#D0021B",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 6,
            zIndex: 99,
          }}
        >
          <Ionicons name="arrow-up" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </View>
  );
}
