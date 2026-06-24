import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const RANK_THEMES = {
  dong: {
    backgroundColor: '#92400e',
    badgeColor: 'rgba(251, 146, 60, 0.2)',
    badgeText: '#fdba74',
    icon: '🥉',
    title: 'Đồng',
    progressColor: '#f59e0b',
  },
  bac: {
    backgroundColor: '#475569',
    badgeColor: 'rgba(203, 213, 225, 0.2)',
    badgeText: '#f1f5f9',
    icon: '🥈',
    title: 'Bạc',
    progressColor: '#cbd5e1',
  },
  vang: {
    backgroundColor: '#a16207',
    badgeColor: 'rgba(250, 204, 21, 0.2)',
    badgeText: '#fef08a',
    icon: '🥇',
    title: 'Vàng',
    progressColor: '#facc15',
  },
  bach_kim: {
    backgroundColor: '#1e3a8a',
    badgeColor: 'rgba(96, 165, 250, 0.2)',
    badgeText: '#bfdbfe',
    icon: '🌟',
    title: 'Bạch Kim',
    progressColor: '#60a5fa',
  },
  kim_cuong: {
    backgroundColor: '#172554',
    badgeColor: 'rgba(129, 140, 248, 0.2)',
    badgeText: '#c7d2fe',
    icon: '💎',
    title: 'Kim Cương',
    progressColor: '#818cf8',
  },
};

type RankType = keyof typeof RANK_THEMES;

interface DynamicElderlyCardProps {
  rankType?: RankType;
  userName?: string;
  accumulatedPts?: string;
  rewardPts?: string;
  currentMilestone?: string;
  targetMilestone?: string;
  nextRank?: string;
  progressPercent?: number;
}

const DynamicElderlyCard = ({
  rankType = 'bach_kim',
  userName = 'Nguyễn Nhật Minh',
  accumulatedPts = '22.889.420',
  rewardPts = '23.889.420',
  currentMilestone = '23 triệu',
  targetMilestone = '100 triệu đ',
  nextRank = 'Kim Cương',
  progressPercent = 23,
}: DynamicElderlyCardProps) => {
  const theme = RANK_THEMES[rankType] ?? RANK_THEMES.dong;

  return (
    <View style={[styles.cardContainer, { backgroundColor: theme.backgroundColor }]}>
      <View style={styles.headerContainer}>
        <View style={styles.nameWrapper}>
          <Text style={styles.greetingText}>Xin chào,</Text>
          <Text style={styles.userNameText}>{userName}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: theme.badgeColor }]}>
          <Text style={styles.badgeIcon}>{theme.icon}</Text>
          <Text style={[styles.badgeText, { color: theme.badgeText }]}>{theme.title}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.pointsContainer}>
        <View style={styles.pointBox}>
          <Text style={styles.pointLabel}>ĐIỂM TÍCH LŨY</Text>
          <Text style={styles.pointValue}>
            {accumulatedPts}{' '}
            <Text style={styles.pointUnit}>pts</Text>
          </Text>
        </View>
        <View style={styles.pointBox}>
          <Text style={styles.pointLabel}>ĐIỂM THƯỞNG</Text>
          <Text style={styles.pointValue}>
            {rewardPts}{' '}
            <Text style={styles.pointUnit}>pts</Text>
          </Text>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { backgroundColor: theme.progressColor, width: `${progressPercent}%` },
          ]}
        />
      </View>

      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>
          <Text style={styles.footerHighlight}>{currentMilestone}</Text>
          {' / '}{targetMilestone} ➝ Nâng hạng {nextRank}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  nameWrapper: {
    flex: 1,
    paddingRight: 16,
  },
  greetingText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 6,
  },
  userNameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    lineHeight: 32,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  badgeIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: 24,
  },
  pointsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  pointBox: {
    flex: 1,
    minWidth: 140,
  },
  pointLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  pointValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  pointUnit: {
    fontSize: 16,
    fontWeight: 'normal',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  progressTrack: {
    height: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  footerContainer: {
    paddingBottom: 4,
  },
  footerText: {
    fontSize: 18,
    color: '#ffffff',
    lineHeight: 28,
  },
  footerHighlight: {
    fontWeight: '900',
  },
});

export default DynamicElderlyCard;
