import { Stack } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity, Text, View, Modal, StyleSheet, Pressable, Dimensions} from "react-native";
import { useRouter } from "expo-router";
import { SegmentsProvider } from "./SegmentsContext";
import { SettingsProvider, useSettings } from "./SettingsContext";
import { useState } from "react";
// @ts-ignore
import Icon from "react-native-vector-icons/Ionicons";

const screenWidth = Dimensions.get("window").width;

export default function RootLayout() {
  return (
    <SettingsProvider>
      <SegmentsProvider>
        <ThemedLayout>
          <DynamicStack />
        </ThemedLayout>
      </SegmentsProvider>
    </SettingsProvider>
  );
}

const DynamicStack = () => {
  const { darkMode } = useSettings();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: darkMode ? "#121212" : "#3F0D72",
        },
        headerTintColor: "#fff",
        headerTitleAlign: "center" as const,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerLeft: () => <HeaderLeft />,
          headerTitle: () => <HeaderTitle />,
          headerRight: () => <DropdownMenu />,
        }}
      />
    </Stack>
  );
};


const HeaderLeft = () => {
  const { language } = useSettings();
  const [clickCount, setClickCount] = useState(0);

  const handleHeaderClick = () => {
    setClickCount((prev) => prev + 1);

    if (clickCount >= 14) {
      alert("Beton pedał");
      setClickCount(0);
    }
  };

  return (
    <View style={styles.headerLeftContainer}>
      <Icon name="dice" size={23} color="white" style={styles.icon} />
      <TouchableOpacity onPress={handleHeaderClick}>
        <Text style={styles.headerLeftText}>
          {language === "pl" ? "Koło Fortuny" : "Wheel Picker"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const HeaderTitle = () => {
  const router = useRouter();
  const { language } = useSettings();

  return (
    <View style={styles.headerTitleContainer}>
      <TouchableOpacity
        onPress={() => router.push("/editSegments")}
        style={styles.headerButton}
      >
        <Text style={styles.headerButtonText}>
          {language === "pl" ? "Edytuj segmenty" : "Edit Segments"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const DropdownMenu = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const { darkMode, toggleDarkMode, language, setLanguage } = useSettings();

  const toggleMenu = () => setMenuVisible(!menuVisible);

  return (
    <View>
      <TouchableOpacity onPress={toggleMenu}>
        <Icon name="ellipsis-vertical" size={24} color="white" />
      </TouchableOpacity>

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={toggleMenu}
      >
        <Pressable style={styles.modalOverlay} onPress={toggleMenu}>
          <View
            style={[
              styles.dropdownMenu,
              { backgroundColor: darkMode ? "#121212" : "#fff" },
            ]}
          >
            <TouchableOpacity
              style={styles.menuItem}
              onPress={toggleDarkMode}
            >
              <Text style={{ color: darkMode ? "#fff" : "#000" }}>
              {language === "pl"
                ? darkMode
                  ? "Przełącz na tryb jasny"
                  : "Przełącz na tryb ciemny"
                : darkMode
                ? "Switch to Light Mode"
                : "Switch to Dark Mode"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setLanguage(language === "pl" ? "en" : "pl")}
            >
              <Text style={{ color: darkMode ? "#fff" : "#000" }}>
                {language === "pl" ? "Switch to English" : "Przełącz na Polski"}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const ThemedLayout = ({ children }: { children: React.ReactNode }) => {
  const { darkMode } = useSettings();

  return (
    <View
      style={[
        styles.container,
        darkMode ? styles.darkBackground : styles.lightBackground,
      ]}
    >
      <StatusBar style="light" />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  darkBackground: {
    backgroundColor: "#121212",
  },
  lightBackground: {
    backgroundColor: "#ffffff",
  },
  headerLeftContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: 90,
  },
  icon: {
    marginRight: screenWidth < 360 ? 3 : 5,
  },
  headerLeftText: {
    color: "white",
    fontSize: screenWidth < 360 ? 14 : 16,
    fontWeight: "bold",
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: screenWidth < 360 ? 5 : 10,
  },
  headerButton: {
    paddingHorizontal: screenWidth < 360 ? 5 : 10,
  },
  headerButtonText: {
    color: "white",
    fontSize: screenWidth < 360 ? 16 : 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownMenu: {
    width: screenWidth * 0.7,
    maxWidth: 300,
    borderRadius: 8,
    padding: 10,
    elevation: 5,
  },
  menuItem: {
    paddingVertical: screenWidth < 360 ? 8 : 10,
    paddingHorizontal: screenWidth < 360 ? 10 : 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
});
