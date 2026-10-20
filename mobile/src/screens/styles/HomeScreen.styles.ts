import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const COLORS = {
  primary: '#2D5016',
  primaryLight: '#4A7C2A',
  accent: '#8CB369',
  bg: '#F8F7F4',
  white: '#FFFFFF',
  text: '#1A1A1A',
  textMuted: '#8A8A8A',
  textLight: '#B5B5B5',
  border: '#EBEBEB',
  heroBg: '#3D6B22',
  pill: '#EEF4E8',
  pillActive: '#2D5016',
  card: '#FFFFFF',
  tag: '#F0F5EB',
};

export const CARD_WIDTH = (width - 48) / 2;

export const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scroll: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: COLORS.bg,
  },
  logo: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 4,
    color: COLORS.primary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '400',
  },

  // Categories
  categoriesWrapper: {
    marginBottom: 8,
  },
  categoriesScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 100,
    backgroundColor: COLORS.pill,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  pillActive: {
    backgroundColor: COLORS.pillActive,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primaryLight,
  },
  pillTextActive: {
    color: COLORS.white,
  },

  // Section
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.primaryLight,
  },

  // Product Grid
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productCardPlaceholder: {
    width: CARD_WIDTH,
  },

  // Empty
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '500',
  },

  // Blog
  blogCard: {
    borderRadius: 16,
    overflow: 'hidden',
    height: 180,
    position: 'relative',
  },
  blogImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  blogOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20, 40, 10, 0.5)',
  },
  blogContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-end',
  },
  blogTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    marginBottom: 8,
  },
  blogTagText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  blogTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
    lineHeight: 20,
    marginBottom: 8,
  },
  blogLink: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.accent,
  },
});
