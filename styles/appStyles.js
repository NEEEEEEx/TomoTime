import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  //========= CONTAINER STYLES =======//
  container: {
    flex: 1,
    maxWidth: 600,
    width: '100%',
    backgroundColor: '#1C1C1C',
    paddingBottom: 25,
    fontFamily: 'Quicksand-Regular',
  },
  background: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  //========= APP LOGO ==========//
  logoContainer: {
    alignItems: 'center',
    marginLeft: 10,
    marginTop: 30,
  },
  appLogo: {
    width: 200,
    height: 200,
  },
  //=============================//

  //========= WELCOME TEXT =======//
  welcomeText: {
    fontSize: 43,
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'Quicksand-Regular'
  },
  titleContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 50,
    fontFamily: 'Quicksand-Bold',
    color: '#333333',
    lineHeight: 42,
  },
  description: {
    fontSize: 17,
    color: '#333333',
    textAlign: 'center',
    marginHorizontal: 16,
    marginBottom: 32,
    lineHeight: 25,
  },
  //=============================//

  //========= ICON STYLES =========//
  icons: {
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
    paddingBottom: 4,
  },
  //===============================//

  //========= BUTTON STYLING =========//
  button: {
    // Touchable wrapper: keeps sizing / spacing / elevation
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    maxWidth: 350,
    elevation: 9,
    borderRadius: 30,
    overflow: 'hidden', // ensure gradient corners are clipped on Android
  },
  // LinearGradient inner style (visual)
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 30,
    gap: 10,
    width: '100%',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 1 },
    textShadowRadius: 4,
  },
  //===============================//
  
  //========= FEATURE CARDS ========//
  cardsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#FEFEFE',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#FFBE5B',
    padding: 20,
    marginBottom: 16,
    width: '100%',
    elevation: 7,
  },
  cardIconContainer: {
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
    fontFamily: 'Quicksand-Bold',
  },
  cardDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  //===============================//

  //========= HEADER STYLES =========//
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
  },

  leftHeader: { 
    width: 40, 
  },

  headerLogo: { 
    width: 50, 
    height: 50, 
    resizeMode: 'contain', 
    borderRadius: 25,
  },

  titleWrap: { 
    flex: 1, 
    alignItems: 'center', 
  },

  headerTitle: { 
    fontSize: 30, 
    color: '#461F04', 
    fontFamily: 'Quicksand-Bold',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 2,
  },

  profileCircle: {
    width: 38,
    height: 38,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  gradientContainer: {
    padding: 2, // Optional: gives a slight cushion around the border
    borderRadius: 20, 
    // Set a fixed size, or let the inner content size it
    alignItems: 'center',
    justifyContent: 'center',
    width: 41, 
    height: 41,
  },
  //===============================//

  //========= Steps Indicator & Buttons =======//
  stepWrap: { 
    paddingHorizontal: 12, 
    marginBottom: 6, 
  },

  stepButtonsRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 12 ,
  },

  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9AA31',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start'
  },

  addText: { 
    color: '#fff', 
    fontWeight: '700', 
    marginLeft: 6 ,
  },

  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#BE1C1C',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-end'
  },

  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#BE1C1C',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start'
  },

  nextText: { 
    color: '#fff', 
    fontWeight: '700', 
    marginRight: 6 ,
  },
  //========================================//

  //========= Section Title Styles =======//

  sectionTitleWrap: { 
    paddingHorizontal: 16, 
    marginTop: 18, 
    marginBottom: 6,
  },


  sectionTitle: { 
    fontSize: 26, 
    fontWeight: '700', 
    textAlign: 'center', 
    color: '#1b120f', 
    fontFamily: 'Quicksand-Bold',
    marginBottom: 6,
  },

  sectionSubtitle: { 
    fontSizeL: 12,
    textAlign: 'center', 
    color: '#000000ff', 
  },
  //====================================//

  //========= Card Styles =======//
  cardWrapper: {
    marginTop: 12,
    borderRadius: 15,
    padding: 14,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#FFBE5B',
    backgroundColor: 'white',
    width: 320,
    minHeight: 120,
    alignSelf: 'center',
  },
  
  cardSelected: {
    borderColor: '#f8b28a',
  },

  cardHeaderRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' ,
  },

  cardTitle: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#FFBE5B',
    fontFamily: 'Quicksand-Bold',
  },

  rightIcons: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },

  cardBody: { 
    marginTop: 12 
  },

  timeRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingVertical: 4 
  },

  timeLabel: { 
    color: '#5e5d5dff' 
  },

  timeValue: { 
    color: '#2c1f17', 
    fontWeight: '700' 
  },
  //=====================================//

  //========= Calendar Styles =======//
  calendar: {
    backgroundColor: '#FEFEFE',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#FFBE5B',
    padding: 15,
    marginBottom: 16,
    width: 350,
    elevation: 7,
  },
  //=================================//

  //========== Burger Menu ==========//
  burgerMenu: {
    position: 'absolute', // This makes it float
    top: 60, // Adjust distance from top to align with hamburger
    left: 5, // Align with left margin
    backgroundColor: '#b91c1c', // The deep red color
    borderRadius: 10,
    paddingVertical: 5,
    width: 200,
    elevation: 10,
    zIndex: 100, // Forces it to be on top of everything else
  },

  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  menuText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },

  //========= Chat AI Screen: Hero & Chat Layout =========//
  chatHeroWrap: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 10,
  },
  chatHeroImage: {
    width: 180,
    height: 180,
  },
  chatHeroTitle: {
    fontSize: 28,
    color: '#2d0c08',
    fontFamily: 'Quicksand-Bold',
    marginTop: -12,
  },
  chatHeroSubtitle: {
    fontSize: 13,
    color: '#2d0c08',
    fontFamily: 'Quicksand-SemiBold',
    marginTop: 4,
    textAlign: 'center',
  },
  chatHeroCaption: {
    fontSize: 12,
    color: '#a65c26',
    marginTop: 6,
    fontFamily: 'Quicksand-Regular',
  },
  chatWindow: {
    flex: 1,
    marginTop: 10,
  },
  //============================================//

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
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
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
  chatPillBubble: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatPillText: {
    fontSize: 15,
    fontFamily: 'Quicksand-Bold',
  },
  //============================================//

  //========= Chat AI Screen: Input Bar =========//
  chatInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 4,
    backgroundColor: 'transparent',
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#f8e7d6',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: '#2d0c08',
    fontFamily: 'Quicksand-Medium',
    marginRight: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
  },
  chatSendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 4,
  },
  //============================================//
});
export default styles;