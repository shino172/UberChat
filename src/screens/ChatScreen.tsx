// src/screens/ChatScreen.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { io } from "socket.io-client";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import { Platform } from "react-native"; // Import Platform để kiểm tra môi trường

type ChatRoom = {
  id: number;
  user_id: string;
  driver_id: string;
  otherUser: { id: string; name: string; profileImageUrl: string };
  lastMessage: string;
  unreadCount: number;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Chat">;

const ChatScreen: React.FC = () => {
  const { userId } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const socket = useRef(io("http://localhost:3000")).current;

  const baseUrl =
    Platform.OS === "web"
      ? "http://localhost:3000" // URL cho web
      : "http://10.0.2.2:3000"; // URL cho giả lập Android

  const fetchChatRooms = async () => {
    try {
      const response = await fetch(`${baseUrl}/chat-rooms/${userId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch chat rooms");
      }
      const data = await response.json();
      console.log("Fetched chat rooms:", data);
      setChatRooms(data);
    } catch (error) {
      console.error("Error fetching chat rooms:", error);
    }
  };

  useEffect(() => {
    fetchChatRooms();
  }, []);

  useEffect(() => {
    // Lắng nghe sự kiện updateUnreadCount từ Socket.IO
    socket.on("updateUnreadCount", ({ roomId, unreadCount }) => {
      console.log(
        `Received updateUnreadCount for room ${roomId}: ${unreadCount}`
      );
      setChatRooms((prevChatRooms) =>
        prevChatRooms.map((room) =>
          room.id.toString() === roomId ? { ...room, unreadCount } : room
        )
      );
    });

    // Dọn dẹp khi component unmount
    return () => {
      socket.off("updateUnreadCount");
    };
  }, []);

  const handleChatPress = (room: ChatRoom) => {
    const baseUrl =
      Platform.OS === "web"
        ? "http://localhost:3000" // URL cho web
        : "http://10.0.2.2:3000"; // URL cho giả lập Android (hoặc thay bằng IP máy tính nếu chạy trên thiết bị thật)

    // Đánh dấu tất cả tin nhắn trong phòng chat là đã đọc khi vào phòng
    const markMessagesAsRead = async () => {
      try {
        await fetch(`${baseUrl}/mark-read/${room.id}/${userId}`, {
          method: "POST",
        });
        setChatRooms((prevChatRooms) =>
          prevChatRooms.map((r) =>
            r.id === room.id ? { ...r, unreadCount: 0 } : r
          )
        );
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    };

    markMessagesAsRead();
    navigation.navigate("ChatDetail", {
      chatId: room.id.toString(),
      user: room.otherUser,
    });
  };

  return (
    <View style={styles.container}>
      <Header title="Chat List" showBackButton={true} />
      {chatRooms.length === 0 ? (
        <Text style={styles.noChatsText}>No chat rooms available.</Text>
      ) : (
        <FlatList
          data={chatRooms}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.chatItem}
              onPress={() => handleChatPress(item)}
            >
              {item.otherUser.profileImageUrl ? (
                <Image
                  source={{ uri: item.otherUser.profileImageUrl }}
                  style={styles.avatar}
                />
              ) : (
                <View style={[styles.avatar, styles.defaultAvatar]}>
                  <Text style={styles.avatarText}>
                    {item.otherUser.name.charAt(0)}
                  </Text>
                </View>
              )}
              <View style={styles.chatInfo}>
                <Text style={styles.chatName}>{item.otherUser.name}</Text>
                <Text style={styles.lastMessage}>{item.lastMessage}</Text>
              </View>
              {item.unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>{item.unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        />
      )}
      <Navbar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F4F4",
    paddingTop: Platform.OS === "android" ? 40 : 10, // Dành khoảng trống trên Android
  },
  noChatsText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginTop: 20,
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 10,
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2, // Hiệu ứng nổi trên Android
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  defaultAvatar: {
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  lastMessage: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  unreadBadge: {
    backgroundColor: "#FF3B30",
    borderRadius: 14,
    minWidth: 26,
    height: 26,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  unreadText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default ChatScreen;
