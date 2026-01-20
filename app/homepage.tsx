import { Text, View, StyleSheet, ScrollView } from "react-native";

export default function Homepage() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.avatar}>👨‍💻</Text>
          <Text style={styles.name}>Vũ Năng Đăng Khoa</Text>
          <Text style={styles.title}>Developer</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📱 Giới thiệu</Text>
          <Text style={styles.text}>
            Xin chào! Tôi là một Mobile Developer đam mê với việc xây dựng ứng dụng di động.
            Tôi có kinh nghiệm với React Native, Flutter và các công nghệ mobile hiện đại.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💼 Kỹ năng</Text>
          <View style={styles.skillContainer}>
            <Text style={styles.skill}>• React Native & Expo</Text>
            <Text style={styles.skill}>• TypeScript & JavaScript</Text>
            <Text style={styles.skill}>• Flutter & Dart</Text>
            <Text style={styles.skill}>• Springboot </Text>
            <Text style={styles.skill}>• NodeJS </Text>
            <Text style={styles.skill}>• REST API & Firebase</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📧 Liên hệ</Text>
          <Text style={styles.text}>📧 Email: 23110119@student.hcmute.edu.vn</Text>
          <Text style={styles.text}>💼 GitHub: https://github.com/iamkvnn</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 30,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    fontSize: 80,
    marginBottom: 15,
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a1a2e",
    marginBottom: 5,
  },
  title: {
    fontSize: 18,
    color: "#666",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1a1a2e",
    marginBottom: 15,
  },
  text: {
    fontSize: 16,
    color: "#444",
    lineHeight: 24,
    marginBottom: 8,
  },
  skillContainer: {
    marginTop: 5,
  },
  skill: {
    fontSize: 16,
    color: "#444",
    marginBottom: 10,
    paddingLeft: 10,
  },
});
