import React from 'react';
import { View, Image, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { theme } from '../../theme';

interface AvatarProps {
  source?: { uri: string } | number;
  size?: 'small' | 'medium' | 'large' | 'xlarge' | 'xxl' | 'profile' | number;
  initials?: string;
  showOnlineStatus?: boolean;
  isOnline?: boolean;
  rankOverlay?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const AVATAR_SIZES = {
  small: 32,
  medium: 44,
  large: 72,
  xlarge: 80,
  xxl: 120,
  profile: 180,
};

const ONLINE_DOT_SIZES = {
  small: 8,
  medium: 12,
  large: 16,
  xlarge: 20,
  xxl: 24,
  profile: 28,
};

export const Avatar: React.FC<AvatarProps> = ({
  source,
  size = 'medium',
  initials,
  showOnlineStatus = false,
  isOnline = false,
  rankOverlay,
  style,
  testID,
}) => {
  const avatarSize = typeof size === 'number' ? size : AVATAR_SIZES[size];
  const onlineDotSize = typeof size === 'number' ? size * 0.3 : ONLINE_DOT_SIZES[size];

  const avatarStyle = [
    styles.avatar,
    {
      width: avatarSize,
      height: avatarSize,
      borderRadius: avatarSize / 2,
    },
    style,
  ];

  const initialsStyle = [
    styles.initials,
    {
      fontSize: avatarSize * 0.4,
    },
  ];

  const onlineDotStyle = [
    styles.onlineDot,
    {
      width: onlineDotSize,
      height: onlineDotSize,
      borderRadius: onlineDotSize / 2,
      right: -2,
      bottom: -2,
    },
  ];

  const rankOverlayStyle = [
    styles.rankOverlay,
    {
      width: avatarSize * 0.6,
      height: avatarSize * 0.6,
      borderRadius: (avatarSize * 0.6) / 2,
      bottom: -4,
      right: -4,
    },
  ];

  return (
    <View style={styles.container} testID={testID}>
      <View style={avatarStyle}>
        {source ? (
          <Image source={source} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            {initials && <Text style={initialsStyle}>{initials}</Text>}
          </View>
        )}
      </View>

      {showOnlineStatus && (
        <View
          style={[
            onlineDotStyle,
            {
              backgroundColor: isOnline ? theme.colors.online : theme.colors.textTertiary,
            },
          ]}
        />
      )}

      {rankOverlay !== undefined && (
        <View style={rankOverlayStyle}>
          <Text style={styles.rankText}>{rankOverlay}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },

  avatar: {
    backgroundColor: theme.colors.borderLight,
    overflow: 'hidden',
  },

  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  initials: {
    color: theme.colors.textInverse,
    fontWeight: theme.typography.weights.semibold,
    textTransform: 'uppercase',
  },

  onlineDot: {
    position: 'absolute',
    backgroundColor: theme.colors.online,
    borderWidth: 2,
    borderColor: theme.colors.white,
  },

  rankOverlay: {
    position: 'absolute',
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.white,
    ...theme.shadows.button,
  },

  rankText: {
    color: theme.colors.textInverse,
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
  },
});
