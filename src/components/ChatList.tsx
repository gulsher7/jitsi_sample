import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  useWindowDimensions,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Mock data for chat list
const chatUsers = [
  { id: '1', name: 'John Doe', lastMessage: 'Hey, how are you?', time: '10:30 AM', avatar: 'https://randomuser.me/api/portraits/men/1.jpg' },
  { id: '2', name: 'Jane Smith', lastMessage: 'Meeting at 2 PM', time: '9:45 AM', avatar: 'https://randomuser.me/api/portraits/women/2.jpg' },
  { id: '3', name: 'Mike Johnson', lastMessage: 'Please check the document', time: 'Yesterday', avatar: 'https://randomuser.me/api/portraits/men/3.jpg' },
  { id: '4', name: 'Emily Davis', lastMessage: 'Thanks for your help!', time: 'Yesterday', avatar: 'https://randomuser.me/api/portraits/women/4.jpg' },
  { id: '5', name: 'Alex Wilson', lastMessage: 'See you tomorrow', time: '2 days ago', avatar: 'https://randomuser.me/api/portraits/men/5.jpg' },
];

const ChatList = () => {
  const navigation = useNavigation();
  const { width, height } = useWindowDimensions();
  const isTablet = Platform.OS === 'ios' && Math.min(width, height) >= 768;

  const renderChatItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => navigation.navigate('ChatMessage', { userId: item.id, name: item.name, avatar: item.avatar })}
    >
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.chatInfo}>
        <View style={styles.nameTimeContainer}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        <Text style={styles.message} numberOfLines={1}>
          {item.lastMessage}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chats</Text>
      </View>
      <FlatList
        data={chatUsers}
        keyExtractor={(item) => item.id}
        renderItem={renderChatItem}
        contentContainerStyle={[
          styles.listContent,
          isTablet && styles.tabletListContent
        ]}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
  },
  tabletListContent: {
    paddingHorizontal: 48,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f8f8f8',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  chatInfo: {
    marginLeft: 16,
    flex: 1,
  },
  nameTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  time: {
    fontSize: 14,
    color: '#888',
  },
  message: {
    fontSize: 14,
    color: '#444',
  },
});

export default ChatList; 