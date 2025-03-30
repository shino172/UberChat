// src/screens/ChatDetailScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  Button,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '@clerk/clerk-expo';
import { io } from 'socket.io-client';
import Header from '../components/Header';

type ChatDetailScreenRouteProp = RouteProp<RootStackParamList, 'ChatDetail'>;

type Message = {
  id: string;
  message_text: string;
  sender_id: string;
  timestamp: string;
};

type Props = {
  route: ChatDetailScreenRouteProp;
};

const ChatDetailScreen: React.FC<Props> = ({ route }) => {
  const { chatId, user } = route.params;
  const { userId } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMessagesLoaded, setIsMessagesLoaded] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const socket = useRef(io('http://localhost:3000')).current;

  const fetchMessages = async () => {
    try {
      console.log('Fetching messages for chatId:', chatId);
      const response = await fetch(`http://localhost:3000/messages/${chatId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      const data = await response.json();
      console.log('Fetched messages:', data);
      setMessages(data);
      setIsMessagesLoaded(true);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setIsMessagesLoaded(true);
    }
  };

  useEffect(() => {
    console.log('chatId:', chatId);
    fetchMessages();
  }, [chatId]);

  useEffect(() => {
    if (!isMessagesLoaded) return;

    socket.emit('joinRoom', chatId);
    console.log('Joined room:', chatId);

    socket.on('message', (message: Message) => {
      console.log('Received new message:', message);
      setMessages((prevMessages) => {
        const existingMessageIndex = prevMessages.findIndex(
          (msg) => msg.message_text === message.message_text && msg.sender_id === message.sender_id
        );
        if (existingMessageIndex !== -1) {
          const updatedMessages = [...prevMessages];
          updatedMessages[existingMessageIndex] = message;
          return updatedMessages;
        }
        return [...prevMessages, message];
      });
    });

    socket.on('typing', ({ roomId, userId: typingUserId }) => {
      if (roomId === chatId && typingUserId !== userId) {
        setIsTyping(true);
      }
    });

    socket.on('stopTyping', ({ roomId, userId: typingUserId }) => {
      if (roomId === chatId && typingUserId !== userId) {
        setIsTyping(false);
      }
    });

    return () => {
      socket.off('message');
      socket.off('typing');
      socket.off('stopTyping');
    };
  }, [isMessagesLoaded, chatId]);

  useEffect(() => {
    console.log('Current messages:', messages);
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSend = () => {
    if (newMessage.trim() === '') return;

    const message = {
      id: Date.now().toString(),
      sender_id: userId!,
      message_text: newMessage,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prevMessages) => [...prevMessages, message]);
    console.log('Added message to state:', message);

    socket.emit('sendMessage', { roomId: chatId, message: { sender_id: userId!, message_text: newMessage } });
    setNewMessage('');
  };

  const handleTyping = () => {
    socket.emit('typing', { roomId: chatId, userId });
  };

  const handleStopTyping = () => {
    socket.emit('stopTyping', { roomId: chatId, userId });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title={user.name} showBackButton={true} />
      <View style={styles.chatContainer}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            console.log('Rendering message:', item);
            return (
              <View
                style={[
                  styles.messageContainer,
                  item.sender_id === userId ? styles.myMessage : styles.otherMessage,
                ]}
              >
                <Text style={styles.messageText}>{item.message_text}</Text>
                <Text style={styles.timestamp}>{item.timestamp}</Text>
              </View>
            );
          }}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
          showsVerticalScrollIndicator={true}
        />
        {isTyping && <Text style={styles.typingIndicator}>User is typing...</Text>}
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={newMessage}
            onChangeText={(text) => {
              setNewMessage(text);
              if (text) handleTyping();
              else handleStopTyping();
            }}
            placeholder="Type a message..."
            multiline
            scrollEnabled={true}
            textAlignVertical="top"
          />
          <Button title="SEND" onPress={handleSend} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F3D9',
  },
  chatContainer: {
    flex: 1,
  },
  messageList: {
    flex: 1,
    padding: 10,
  },
  messageListContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  messageContainer: {
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
    maxWidth: '80%',
  },
  myMessage: {
    backgroundColor: '#EBE5C2',
    alignSelf: 'flex-end',
  },
  otherMessage: {
    backgroundColor: '#B9B28A',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
    color: '#000',
  },
  timestamp: {
    fontSize: 12,
    color: 'black',
    marginTop: 5,
    textAlign: 'right',
  },
  typingIndicator: {
    fontSize: 14,
    color: '#888',
    padding: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    backgroundColor: '#fff',
    alignItems: 'center',
    height: 60,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    padding: 10,
    marginRight: 10,
    height: 40,
  },
});

export default ChatDetailScreen;

// // src/screens/ChatDetailScreen.tsx
// import React, { useState, useEffect, useRef } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   TextInput,
//   Button,
//   StyleSheet,
//   KeyboardAvoidingView,
//   Platform,
//   SafeAreaView,
// } from 'react-native';
// import { RouteProp } from '@react-navigation/native';
// import { RootStackParamList } from '../types/navigation';
// import { useAuth } from '@clerk/clerk-expo';
// import { io } from 'socket.io-client';
// import Header from '../components/Header';

// type ChatDetailScreenRouteProp = RouteProp<RootStackParamList, 'ChatDetail'>;

// type Message = {
//   id: string;
//   message_text: string;
//   sender_id: string;
//   timestamp: string;
// };

// type Props = {
//   route: ChatDetailScreenRouteProp;
// };

// const ChatDetailScreen: React.FC<Props> = ({ route }) => {
//   const { chatId, user } = route.params;
//   const { userId } = useAuth();
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [newMessage, setNewMessage] = useState('');
//   const [isTyping, setIsTyping] = useState(false);
//   const [isMessagesLoaded, setIsMessagesLoaded] = useState(false);
//   const flatListRef = useRef<FlatList>(null);
//   const socket = useRef(io('http://localhost:3000')).current;

//   const fetchMessages = async () => {
//     try {
//       console.log('Fetching messages for chatId:', chatId);
//       const response = await fetch(`http://localhost:3000/messages/${chatId}`);
//       if (!response.ok) {
//         throw new Error('Failed to fetch messages');
//       }
//       const data = await response.json();
//       console.log('Fetched messages:', data);
//       setMessages(data);
//       setIsMessagesLoaded(true);
//     } catch (error) {
//       console.error('Error fetching messages:', error);
//       setIsMessagesLoaded(true);
//     }
//   };

//   useEffect(() => {
//     console.log('chatId:', chatId);
//     fetchMessages();
//   }, [chatId]);

//   useEffect(() => {
//     if (!isMessagesLoaded) return;

//     socket.emit('joinRoom', chatId);
//     console.log('Joined room:', chatId);

//     socket.on('message', (message: Message) => {
//       console.log('Received new message:', message);
//       setMessages((prevMessages) => {
//         const existingMessageIndex = prevMessages.findIndex(
//           (msg) => msg.message_text === message.message_text && msg.sender_id === message.sender_id
//         );
//         if (existingMessageIndex !== -1) {
//           const updatedMessages = [...prevMessages];
//           updatedMessages[existingMessageIndex] = message;
//           return updatedMessages;
//         }
//         return [...prevMessages, message];
//       });
//     });

//     socket.on('typing', ({ roomId, userId: typingUserId }) => {
//       if (roomId === chatId && typingUserId !== userId) {
//         setIsTyping(true);
//       }
//     });

//     socket.on('stopTyping', ({ roomId, userId: typingUserId }) => {
//       if (roomId === chatId && typingUserId !== userId) {
//         setIsTyping(false);
//       }
//     });

//     return () => {
//       socket.off('message');
//       socket.off('typing');
//       socket.off('stopTyping');
//     };
//   }, [isMessagesLoaded, chatId]);

//   useEffect(() => {
//     console.log('Current messages:', messages);
//     if (flatListRef.current && messages.length > 0) {
//       flatListRef.current.scrollToEnd({ animated: true });
//     }
//   }, [messages]);

//   const handleSend = async () => {
//     if (newMessage.trim() === '') return;

//     const message = {
//       id: Date.now().toString(),
//       sender_id: userId!,
//       message_text: newMessage,
//       timestamp: new Date().toLocaleTimeString(),
//     };

//     try {
//       // Gửi tin nhắn đến backend để lưu vào database
//       const response = await fetch('http://localhost:3000/messages', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           message_room_id: chatId,
//           sender_id: userId,
//           message_text: newMessage,
//         }),
//       });

//       if (!response.ok) {
//         throw new Error('Failed to save message');
//       }

//       // Gửi tin nhắn qua Socket.IO
//       socket.emit('sendMessage', { roomId: chatId, message: { sender_id: userId!, message_text: newMessage } });
//       setMessages((prevMessages) => [...prevMessages, message]);
//       setNewMessage('');
//     } catch (error) {
//       console.error('Error sending message:', error);
//     }
//   };

//   const handleTyping = () => {
//     socket.emit('typing', { roomId: chatId, userId });
//   };

//   const handleStopTyping = () => {
//     socket.emit('stopTyping', { roomId: chatId, userId });
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <Header title={user.name} showBackButton={true} />
//       <View style={styles.chatContainer}>
//         <FlatList
//           ref={flatListRef}
//           data={messages}
//           keyExtractor={(item) => item.id.toString()}
//           renderItem={({ item }) => {
//             console.log('Rendering message:', item);
//             return (
//               <View
//                 style={[
//                   styles.messageContainer,
//                   item.sender_id === userId ? styles.myMessage : styles.otherMessage,
//                 ]}
//               >
//                 <Text style={styles.messageText}>{item.message_text}</Text>
//                 <Text style={styles.timestamp}>{item.timestamp}</Text>
//               </View>
//             );
//           }}
//           style={styles.messageList}
//           contentContainerStyle={styles.messageListContent}
//           showsVerticalScrollIndicator={true}
//         />
//         {isTyping && <Text style={styles.typingIndicator}>User is typing...</Text>}
//       </View>
//       <KeyboardAvoidingView
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
//       >
//         <View style={styles.inputContainer}>
//           <TextInput
//             style={styles.input}
//             value={newMessage}
//             onChangeText={(text) => {
//               setNewMessage(text);
//               if (text) handleTyping();
//               else handleStopTyping();
//             }}
//             placeholder="Type a message..."
//             multiline
//             scrollEnabled={true}
//             textAlignVertical="top"
//           />
//           <Button title="SEND" onPress={handleSend} />
//         </View>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f5f5f5',
//   },
//   chatContainer: {
//     flex: 1,
//   },
//   messageList: {
//     flex: 1,
//     padding: 10,
//   },
//   messageListContent: {
//     flexGrow: 1,
//     justifyContent: 'flex-end',
//   },
//   messageContainer: {
//     marginVertical: 5,
//     padding: 10,
//     borderRadius: 10,
//     maxWidth: '80%',
//   },
//   myMessage: {
//     backgroundColor: '#007AFF',
//     alignSelf: 'flex-end',
//   },
//   otherMessage: {
//     backgroundColor: '#E5E5EA',
//     alignSelf: 'flex-start',
//   },
//   messageText: {
//     fontSize: 16,
//     color: '#000',
//   },
//   timestamp: {
//     fontSize: 12,
//     color: '#888',
//     marginTop: 5,
//     textAlign: 'right',
//   },
//   typingIndicator: {
//     fontSize: 14,
//     color: '#888',
//     padding: 10,
//   },
//   inputContainer: {
//     flexDirection: 'row',
//     padding: 10,
//     borderTopWidth: 1,
//     borderTopColor: '#ccc',
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     height: 60,
//   },
//   input: {
//     flex: 1,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 20,
//     padding: 10,
//     marginRight: 10,
//     height: 40,
//   },
// });

// export default ChatDetailScreen;