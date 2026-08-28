import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing } from '../utils/theme';

// Beyond this the content stops stretching and centres instead, so text
// lines stay readable on tablets and in split-screen.
export const MAX_CONTENT_WIDTH = 620;

/**
 * Layout values every screen needs:
 *  - wrapperStyle: keeps content clear of the status bar / camera cutout
 *  - contentStyle: responsive gutters that centre content on wide screens
 *  - contentWidth: usable width inside the gutters, for sizing charts
 */
export default function useScreenLayout() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const gutter = Math.max(spacing.lg, (width - MAX_CONTENT_WIDTH) / 2);

  return {
    wrapperStyle: { paddingTop: insets.top },
    contentStyle: { paddingHorizontal: gutter },
    contentWidth: width - gutter * 2,
  };
}
