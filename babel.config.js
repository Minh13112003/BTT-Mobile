module.exports = function (api) {
    api.cache(true);
  
    return {
      presets: [
        ["babel-preset-expo", { jsxImportSource: "nativewind" }],
        "nativewind/babel",
      ],
      plugins: [
        // Phải để plugin Reanimated ở DÒNG CUỐI CÙNG
        'react-native-reanimated/plugin',
      ],
    };
  };