// // src/screens/ChatScreen.tsx
// import React, { useState, useEffect } from 'react';
// import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
// import { useAuth } from '@clerk/clerk-expo';
// import { useNavigation } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { RootStackParamList } from '../types/navigation';
// import sql from '../db';

// type ChatRoom = {
//   id: number;
//   user_id: string;
//   driver_id: string;
//   otherUser: { id: string; name: string; profileImageUrl: string };
//   lastMessage: string;
// };

// type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Chat'>;

// const ChatScreen: React.FC = () => {
//   const { userId } = useAuth();
//   const navigation = useNavigation<NavigationProp>();
//   const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
//   const [isDriver, setIsDriver] = useState<boolean | null>(null);

//   const checkUserRole = async () => {
//     try {
//       const driverQuery = await sql`
//         SELECT id FROM driver WHERE id = ${userId}
//       `;
//       if (driverQuery.length > 0) {
//         setIsDriver(true);
//       } else {
//         const userQuery = await sql`
//           SELECT id FROM "user" WHERE id = ${userId}
//         `;
//         if (userQuery.length > 0) {
//           setIsDriver(false);
//         }
//       }
//     } catch (error) {
//       console.error('Error checking user role:', error);
//     }
//   };

//   const fetchChatRooms = async () => {
//     if (isDriver === null) return;

//     try {
//       const roomsQuery = await sql`
//         SELECT mr.id, mr.user_id, mr.driver_id,
//                (SELECT m.message_text 
//                 FROM messages m 
//                 WHERE m.message_room_id = mr.id 
//                 ORDER BY m.timestamp DESC 
//                 LIMIT 1) as last_message
//         FROM message_room mr
//         WHERE mr.user_id = ${userId} OR mr.driver_id = ${userId}
//       `;

//       const chatRoomsWithUsers: ChatRoom[] = await Promise.all(
//         roomsQuery.map(async (room: any) => {
//           const otherUserId = room.user_id === userId ? room.driver_id : room.user_id;
//           let otherUserName = `Unknown User`;
//           let profileImageUrl = '';

//           try {
//             if (isDriver) {
//               const userQuery = await sql`
//                 SELECT name, profile_image_url FROM "user" WHERE id = ${otherUserId}
//               `;
//               if (userQuery.length > 0) {
//                 otherUserName = userQuery[0].name;
//                 profileImageUrl = userQuery[0].profile_image_url || '';
//               }
//             } else {
//               const driverQuery = await sql`
//                 SELECT name, profile_image_url FROM driver WHERE id = ${otherUserId}
//               `;
//               if (driverQuery.length > 0) {
//                 otherUserName = driverQuery[0].name;
//                 profileImageUrl = driverQuery[0].profile_image_url || '';
//               }
//             }
//           } catch (error) {
//             console.error(`Error fetching name for ${otherUserId}:`, error);
//           }

//           const otherUser = { id: otherUserId, name: otherUserName, profileImageUrl };
//           return {
//             id: room.id,
//             user_id: room.user_id,
//             driver_id: room.driver_id,
//             otherUser,
//             lastMessage: room.last_message || 'No messages yet',
//           };
//         })
//       );

//       setChatRooms(chatRoomsWithUsers);
//     } catch (error) {
//       console.error('Error fetching chat rooms:', error);
//     }
//   };

//   useEffect(() => {
//     checkUserRole();
//   }, []);

//   useEffect(() => {
//     if (isDriver !== null) {
//       fetchChatRooms();
//     }
//   }, [isDriver]);

//   const handleChatPress = (room: ChatRoom) => {
//     navigation.navigate('ChatDetail', {
//       chatId: room.id.toString(),
//       user: room.otherUser,
//     });
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Chats</Text>
//       {isDriver === null ? (
//         <Text>Loading...</Text>
//       ) : chatRooms.length === 0 ? (
//         <Text>No chat rooms available.</Text>
//       ) : (
//         <FlatList
//           data={chatRooms}
//           keyExtractor={(item) => item.id.toString()}
//           renderItem={({ item }) => (
//             <TouchableOpacity style={styles.chatItem} onPress={() => handleChatPress(item)}>
//               {item.otherUser.profileImageUrl ? (
//                 <Image
//                   source={{ uri: item.otherUser.profileImageUrl }}
//                   style={styles.avatar}
//                 />
//               ) : (
//                 <View style={[styles.avatar, styles.defaultAvatar]}>
//                   <Text style={styles.avatarText}>{item.otherUser.name.charAt(0)}</Text>
//                 </View>
//               )}
//               <View style={styles.chatInfo}>
//                 <Text style={styles.chatName}>{item.otherUser.name}</Text>
//                 <Text style={styles.lastMessage}>{item.lastMessage}</Text>
//               </View>
//             </TouchableOpacity>
//           )}
//         />
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f5f5f5',
//     padding: 10,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   chatItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 15,
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     marginBottom: 10,
//   },
//   avatar: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     marginRight: 10,
//   },
//   defaultAvatar: {
//     backgroundColor: '#007AFF',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   avatarText: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   chatInfo: {
//     flex: 1,
//   },
//   chatName: {
//     fontSize: 18,
//   },
//   lastMessage: {
//     fontSize: 14,
//     color: '#888',
//     marginTop: 5,
//   },
// });

// export default ChatScreen;


// src/screens/ChatScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { io } from 'socket.io-client';
import Header from '../components/Header';

type ChatRoom = {
  id: number;
  user_id: string;
  driver_id: string;
  otherUser: { id: string; name: string; profileImageUrl: string };
  lastMessage: string;
  unreadCount: number;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Chat'>;

const ChatScreen: React.FC = () => {
  const { userId } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const socket = useRef(io('http://localhost:3000')).current;

  const fetchChatRooms = async () => {
    try {
      const response = await fetch(`http://localhost:3000/chat-rooms/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch chat rooms');
      }
      const data = await response.json();
      console.log('Fetched chat rooms:', data);
      setChatRooms(data);
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
    }
  };

  useEffect(() => {
    fetchChatRooms();
  }, []);

  useEffect(() => {
    // Lắng nghe sự kiện updateUnreadCount từ Socket.IO
    socket.on('updateUnreadCount', ({ roomId, unreadCount }) => {
      console.log(`Received updateUnreadCount for room ${roomId}: ${unreadCount}`);
      setChatRooms((prevChatRooms) =>
        prevChatRooms.map((room) =>
          room.id.toString() === roomId ? { ...room, unreadCount } : room
        )
      );
    });

    // Dọn dẹp khi component unmount
    return () => {
      socket.off('updateUnreadCount');
    };
  }, []);

  const handleChatPress = (room: ChatRoom) => {
    // Đánh dấu tất cả tin nhắn trong phòng chat là đã đọc khi vào phòng
    const markMessagesAsRead = async () => {
      try {
        await fetch(`http://localhost:3000/mark-read/${room.id}/${userId}`, {
          method: 'POST',
        });
        setChatRooms((prevChatRooms) =>
          prevChatRooms.map((r) =>
            r.id === room.id ? { ...r, unreadCount: 0 } : r
          )
        );
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    };

    markMessagesAsRead();
    navigation.navigate('ChatDetail', {
      chatId: room.id.toString(),
      user: room.otherUser,
    });
  };

  return (
    <View style={styles.container}>
      <Header title="Chats" showBackButton={true} />
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
                  <Text style={styles.avatarText}>{item.otherUser.name.charAt(0)}</Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  noChatsText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    marginHorizontal: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  defaultAvatar: {
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  lastMessage: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },
  unreadBadge: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default ChatScreen;