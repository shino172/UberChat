// src/types/navigation.ts
export type RootStackParamList = {
  SignIn: undefined;
  Home: undefined;
  Orders: undefined;
  Profile: undefined;
  Chat: undefined;
  ChatDetail: {
    chatId: string;
    user: { id: string; name: string; profileImageUrl: string };
  };
  Login: undefined;
};
