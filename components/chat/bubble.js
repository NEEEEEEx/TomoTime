import { View, Text, StyleSheet, Image } from 'react-native';

const Bubble = (props) => {
    const { text, type } = props;
    return (
        <View style={[styles.chatMessageRow, type === 'user' && { justifyContent: 'flex-end' }, text === 'Loading...' && { justifyContent: 'center'}]}>
        {/* ----------- Bot Avatar ----------- */}
        {type === 'assistant' && (
          <View style={styles.chatAvatarWrap}>
            <Image
              source={require('../../assests/images/tomo-logo.png')}
              style={styles.chatAvatar}
            />
          </View>
        )}
  
        <View
          style={[
            styles.chatBubble,
            type === 'user' ? styles.chatUserBubble : styles.chatBotBubble,
            type === 'assistant' && styles.chatBotBubble,
          ]}
        >
          <Text
            style={[
              styles.chatBubbleText,
              type === 'user' ? styles.chatUserText : styles.chatBotText,
              type === 'assistant' && styles.chatBotText,
            ]}
          >
            {text}
          </Text>
        </View>
      </View>
    );
}

const styles = StyleSheet.create({
    //========= Chat AI Screen: Messages =========//
    chatMessageRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginVertical: 6,
    },
    chatAvatarWrap: {
        width: 38,
        height: 38,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 3,
        elevation: 3,
    },
    chatAvatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
    },
    chatBubble: {
        maxWidth: '78%',
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 14,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    chatBotBubble: {
        backgroundColor: 'rgba(255, 255, 255, 1)',
    },
    chatUserBubble: {
        backgroundColor: '#e48f27',
        borderTopRightRadius: 4,
    },
    chatBubbleText: {
        fontSize: 13,
        lineHeight: 18,
    },
    chatBotText: {
        color: '#2d0c08',
        fontFamily: 'Quicksand-Medium',
    },
    chatUserText: {
        color: '#ffffff',
        fontFamily: 'Quicksand-Bold',
    },
    //============================================//
});

export default Bubble;