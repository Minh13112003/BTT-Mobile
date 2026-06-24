import { getPalette } from "@/constants/theme";
import { useTheme } from "@/context/Theme_Context";
import { getTipById, TravelTip } from "@/services/tips";
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

export default function TipDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const palette = getPalette(isDark);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();


  const scrollViewRef = useRef<ScrollView>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const [item, setItem] = useState<TravelTip | null>(null);
  const [loading, setLoading] = useState(true);
  const [zoomImageUrl, setZoomImageUrl] = useState<string | null>(null);

  const handleCloseModal = () => {
    setZoomImageUrl(null);
  };

  useEffect(() => {
    if (!id) return;
    getTipById(id)
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
            {item?.title ?? "Mẹo du lịch"}
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
              {/* Destination badge + date */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 12,
                  gap: 8,
                  flexWrap: "wrap",
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
                    📍 {item.destination}
                  </Text>
                </View>
                <Text
                  style={{ fontSize: 13, color: "#94A3B8", fontWeight: "600" }}
                >
                  📅 {item.date}
                </Text>
              </View>

              {/* Tags */}
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 6,
                  marginBottom: 16,
                }}
              >
                {item.tags.map((tag) => (
                  <View
                    key={tag}
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 6,
                      backgroundColor: isDark ? "#1F2937" : "#F1F5F9",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "600",
                        color: isDark ? "#94A3B8" : "#64748B",
                      }}
                    >
                      #{tag}
                    </Text>
                  </View>
                ))}
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
                    backgroundColor: isDark ? "#2A2315" : "#FFFDF5",
                    borderLeftWidth: 4,
                    borderLeftColor: "#825500", // secondary gold color
                    marginBottom: 20,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      fontStyle: "italic",
                      color: isDark ? "#FCD34D" : "#825500",
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

              <View style={{ marginBottom: 10 }}>
                {/<\/?[a-z][\s\S]*>/i.test(item.content || "") ? (
                  <RenderHTML
                    contentWidth={width - 40}
                    source={{ html: cleanTextForVietnamese(item.content || "") }}
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
                        fontSize: 15,
                        color: isDark ? "#CBD5E1" : "#334155",
                        lineHeight: 24,
                        marginBottom: 14,
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
                        fontSize: 20,
                        fontWeight: "bold",
                        marginVertical: 10,
                        color: isDark ? "#F8FAFC" : "#0F172A",
                      },
                      h2: {
                        fontSize: 18,
                        fontWeight: "bold",
                        marginVertical: 8,
                        color: isDark ? "#F8FAFC" : "#0F172A",
                      },
                      h3: {
                        fontSize: 16,
                        fontWeight: "bold",
                        marginVertical: 6,
                        color: isDark ? "#F8FAFC" : "#0F172A",
                      },
                      ul: { marginVertical: 8, paddingLeft: 16 },
                      ol: { marginVertical: 8, paddingLeft: 16 },
                      li: {
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
                              color: "#825500",
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

              {/* CTA — Related tours */}
              {!!item.relatedSearchQuery && (
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: "/(root)/(tabs)/search" as any,
                      params: { q: item.relatedSearchQuery, referrer: "tip" },
                    })
                  }
                  activeOpacity={0.9}
                  style={{
                    marginTop: 20,
                    borderRadius: 16,
                    backgroundColor: isDark ? "#2D1B1B" : "#FFF1F2",
                    borderWidth: 1.5,
                    borderColor: "#D0021B",
                    padding: 18,
                    shadowColor: "#D0021B",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 3,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 8,
                    }}
                  >
                    <Ionicons name="map-outline" size={24} color="#D0021B" />
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "800",
                        color: isDark ? "#FFA4A4" : "#99000D",
                      }}
                    >
                      Khám phá Tour du lịch {item.destination}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 13,
                      color: isDark ? "#94A3B8" : "#64748B",
                      lineHeight: 18,
                      marginBottom: 14,
                    }}
                  >
                    Xem các chương trình tour đang mở bán tại BenThanh Tourist
                    và lên lịch trình cho chuyến đi hoàn hảo của bạn.
                  </Text>
                  <View
                    style={{
                      backgroundColor: "#D0021B",
                      paddingVertical: 10,
                      borderRadius: 10,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "700",
                        color: "#FFFFFF",
                        letterSpacing: 0.5,
                      }}
                    >
                      XEM CHI TIẾT TOUR NGAY
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
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
