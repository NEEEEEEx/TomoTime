import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxWidth: 600,
    width: '100%',
    backgroundColor: '#1C1C1C',
    paddingBottom: 25,
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
  logo: {
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
    width: '90%',
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
});
export default styles;