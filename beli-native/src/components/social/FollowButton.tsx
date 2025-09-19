import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { Button } from '../base';
import { theme } from '../../theme';

interface FollowButtonProps {
  isFollowing: boolean;
  onPress: () => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  testID?: string;
}

export const FollowButton: React.FC<FollowButtonProps> = ({
  isFollowing,
  onPress,
  disabled = false,
  size = 'medium',
  style,
  testID,
}) => {
  return (
    <Button
      title={isFollowing ? 'Following' : 'Follow'}
      onPress={onPress}
      variant={isFollowing ? 'secondary' : 'primary'}
      size={size}
      disabled={disabled}
      style={[
        styles.button,
        isFollowing && styles.followingButton,
        style,
      ]}
      textStyle={[
        isFollowing && styles.followingText,
      ]}
      testID={testID}
    />
  );
};

const styles = StyleSheet.create({
  button: {
    minWidth: 80,
  },

  followingButton: {
    borderColor: theme.colors.success,
  },

  followingText: {
    color: theme.colors.success,
  },
});