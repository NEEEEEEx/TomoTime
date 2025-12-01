import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  sheet: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: {width:0,height:6},
    shadowOpacity: 0.12,
    elevation: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    fontFamily: 'QuickSand-Bold',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 10,
  },
  subtitle: {
    color: '#666',
    marginTop: 6,
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    color: '#333',
    marginTop: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ffd9b3',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 8,
    color: '#222',
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  smallInputWrap: {
    flex: 1,
    marginRight: 8,
  },
  smallLabel: {
    fontSize: 12,
    color: '#333',
    marginBottom: 6,
  },
  smallInput: {
    borderWidth: 1,
    borderColor: '#ffd9b3',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#222',
  },
  addBtnWrap: {
    marginTop: 16,
  },
  addBtn: {
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
});

export default styles;