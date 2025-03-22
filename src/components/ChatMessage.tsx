import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Image,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  Alert
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { JitsiMeeting } from '@jitsi/react-native-sdk';
import RNCallKeep from 'react-native-callkeep';


interface ChatMessageParams {
  userId: string;
  name: string;
  avatar: string;
}

const ChatMessage = () => {
  const [messages, setMessages] = useState([
    { id: '1', text: 'Hi there!', sender: 'them', time: '10:01 AM' },
    { id: '2', text: 'Hello! How are you?', sender: 'me', time: '10:02 AM' },
    { id: '3', text: 'I\'m good, thanks for asking.', sender: 'them', time: '10:03 AM' },
    { id: '4', text: 'What about you?', sender: 'them', time: '10:03 AM' },
    { id: '5', text: 'I\'m doing well too!', sender: 'me', time: '10:04 AM' },
  ]);
  const [inputText, setInputText] = useState('');
  const [isInCall, setIsInCall] = useState(false);
  const [callType, setCallType] = useState<'audio' | 'video' | null>(null);
  const [room, setRoom] = useState('');
  const [callUUID, setCallUUID] = useState('');
  
  const route = useRoute();
  const navigation = useNavigation();
  const params = route.params as ChatMessageParams || { userId: '', name: '', avatar: '' };
  const { userId, name, avatar } = params;
  const { width, height } = useWindowDimensions();
  const isTablet = Platform.OS === 'ios' && Math.min(width, height) >= 768;
  
  const flatListRef = useRef<FlatList>(null);
  const jitsiMeetingRef = useRef(null);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const onSend = () => {
    if (inputText.trim() === '') return;
    
    const newMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    setMessages([...messages, newMessage]);
    setInputText('');
  };

  const startCall = (type: 'audio' | 'video') => {
    try {
      // Generate a unique ID for the call
      const newCallUUID = "sdfsdfsdfsdfdsf"
      setCallUUID(newCallUUID);
      
      // Generate a unique room name
      const roomName = `chat-${userId}-${Date.now()}`;
      setRoom(roomName);
      setCallType(type);
      
      // Start outgoing call with CallKeep
      RNCallKeep.startCall(newCallUUID, name, name, 'generic', type === 'video');
      
      // Store call data
      global.currentCall = {
        callUUID: newCallUUID,
        roomName,
        callerId: 'me',
        callerName: name,
        isVideoCall: type === 'video'
      };
      
      // Set call active
      setTimeout(() => {
        RNCallKeep.setCurrentCallActive(newCallUUID);
        setIsInCall(true);
      }, 1000);
      
      // Listen for call termination
      const endCallListener = RNCallKeep.addEventListener('endCall', ({ callUUID }) => {
        if (callUUID === newCallUUID) {
          setIsInCall(false);
          RNCallKeep.removeEventListener('endCall', endCallListener);
        }
      });
      
    } catch (error) {
      console.error('Error starting call:', error);
      Alert.alert('Call Error', 'Failed to start call. Falling back to direct join.');
      
      // Fallback to direct join if CallKeep fails
      setCallType(type);
      setIsInCall(true);
      const roomName = `chat-${userId}-${Date.now()}`;
      setRoom(roomName);
    }
  };

  const onReadyToClose = useCallback(() => {
    setIsInCall(false);
    if (callUUID) {
      RNCallKeep.endCall(callUUID);
      setCallUUID('');
    }
    if (jitsiMeetingRef.current) {
      // @ts-ignore
      jitsiMeetingRef.current.close();
    }
  }, [callUUID]);

  const onConferenceTerminated = useCallback(() => {
    setIsInCall(false);
    if (callUUID) {
      RNCallKeep.endCall(callUUID);
      setCallUUID('');
    }
  }, [callUUID]);

  const eventListeners = {
    onReadyToClose,
    onConferenceTerminated
  };

  const renderMessage = ({ item }: { item: any }) => (
    <View style={[
      styles.messageBubble,
      item.sender === 'me' ? styles.myMessage : styles.theirMessage,
      isTablet && (item.sender === 'me' ? styles.tabletMyMessage : styles.tabletTheirMessage)
    ]}>
      <Text style={[
        styles.messageText,
        item.sender === 'them' && { color: '#000' }
      ]}>
        {item.text}
      </Text>
      <Text style={[
        styles.timeText,
        item.sender === 'them' && { color: 'rgba(0, 0, 0, 0.5)' }
      ]}>
        {item.time}
      </Text>
    </View>
  );

  if (isInCall) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.callContainer}>
          <JitsiMeeting
            ref={jitsiMeetingRef}
            style={styles.jitsiMeetView}
            room={room}
            serverURL="https://alpha.jitsi.net"
            config={{
              hideConferenceTimer: false,
              prejoinPageEnabled: false,
              startWithAudioMuted: false,
              startWithVideoMuted: callType === 'audio',
              whiteboard: {
                enabled: true,
                collabServerBaseUrl: "https://alpha.jitsi.net/",
              },
            }}
            userInfo={{
              displayName: 'Me',
              email: '',
              avatarURL: '',
            }}
            flags={{
              "audioMute.enabled": true,
              "ios.screensharing.enabled": true,
              "fullscreen.enabled": false,
              "audioOnly.enabled": callType === 'audio',
              "android.screensharing.enabled": true,
              "pip.enabled": true,
              "pip-while-screen-sharing.enabled": true,
              "conference-timer.enabled": true,
              "close-captions.enabled": false,
              "toolbox.enabled": true,
              "prejoinPage.enabled": false,
            }}
            eventListeners={eventListeners as any}
          />
          <TouchableOpacity style={styles.endCallButton} onPress={onReadyToClose}>
            <Text style={styles.endCallText}>End Call</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Image source={{ uri: avatar }} style={styles.headerAvatar} />
        <Text style={styles.headerName}>{name}</Text>
        <View style={styles.callButtons}>
          <TouchableOpacity 
            style={[styles.callButton, { backgroundColor: '#4CAF50' }]} 
            onPress={() => startCall('audio')}
          >
            <Text style={styles.callButtonText}>Audio</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.callButton, { backgroundColor: '#2196F3' }]} 
            onPress={() => startCall('video')}
          >
            <Text style={styles.callButtonText}>Video</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={[
          styles.messagesContainer,
          isTablet && styles.tabletMessagesContainer
        ]}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, isTablet && styles.tabletInput]}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={onSend}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  callButtons: {
    flexDirection: 'row',
  },
  callButton: {
    marginLeft: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  callButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  messagesContainer: {
    padding: 16,
  },
  tabletMessagesContainer: {
    paddingHorizontal: 48,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E5EA',
  },
  tabletMyMessage: {
    maxWidth: '60%',
  },
  tabletTheirMessage: {
    maxWidth: '60%',
  },
  messageText: {
    fontSize: 16,
    color: '#fff',
  },
  timeText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 120,
  },
  tabletInput: {
    fontSize: 18,
  },
  sendButton: {
    marginLeft: 12,
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  callContainer: {
    flex: 1,
    position: 'relative',
  },
  jitsiMeetView: {
    flex: 1,
  },
  endCallButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: 'red',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  endCallText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ChatMessage; 