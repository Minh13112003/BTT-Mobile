import { useTheme } from "@/context/Theme_Context";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface AccordionProps {
  title: string;
  /** Optional leading badge number (e.g. for ordered terms). */
  number?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

/** Reusable collapsible section. Self-themed via Theme_Context. */
export function Accordion({ title, number, defaultOpen = false, children }: AccordionProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [open, setOpen] = useState(defaultOpen);

  return (
    <View
      className={`rounded-2xl mb-2.5 overflow-hidden border ${
        isDark ? "bg-[#1A1F2B] border-[#272D3C]" : "bg-white border-slate-100"
      }`}
    >
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setOpen((o) => !o)}
        className="flex-row items-center justify-between px-3.5 py-3.5"
      >
        <View className="flex-row items-center flex-1 pr-3">
          {number != null && (
            <View className="w-6 h-6 rounded-lg items-center justify-center mr-2.5 bg-[#E51F27]/15">
              <Text className="text-base font-black text-[#E51F27]">{number}</Text>
            </View>
          )}
          <Text
            className={`text-base font-bold flex-1 ${
              isDark ? "text-slate-100" : "text-slate-800"
            }`}
          >
            {title}
          </Text>
        </View>
        <Ionicons
          name={open ? "chevron-down" : "chevron-forward"}
          size={16}
          color={isDark ? "#7E8597" : "#94A3B8"}
        />
      </TouchableOpacity>
      {open && <View className="px-3.5 pb-3.5 pl-11">{children}</View>}
    </View>
  );
}
