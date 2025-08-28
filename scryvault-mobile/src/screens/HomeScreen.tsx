import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const navigation = useNavigation();

  const navigateToScan = () => {
    navigation.navigate('Scan');
  };

  const navigateToInventory = () => {
    navigation.navigate('Inventory');
  };

  const navigateToAnalytics = () => {
    navigation.navigate('Analytics');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Ionicons name="library" size={24} color="#ffffff" />
          </View>
          <View style={styles.logoGlow} />
        </View>
        <Text style={styles.title}>ScryVault</Text>
        <Text style={styles.subtitle}>Scan-to-Live Platform</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="library" size={20} color="#10b981" />
          </View>
          <Text style={styles.statNumber}>1,247</Text>
          <Text style={styles.statLabel}>Total Books</Text>
          <Text style={styles.statChange}>+12% from last month</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="trending-up" size={20} color="#3b82f6" />
          </View>
          <Text style={styles.statNumber}>$12,847</Text>
          <Text style={styles.statLabel}>Monthly Revenue</Text>
          <Text style={styles.statChange}>+23% from last month</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
          </View>
          <Text style={styles.statNumber}>892</Text>
          <Text style={styles.statLabel}>Active Listings</Text>
          <Text style={styles.statChange}>+8% from last month</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="analytics" size={20} color="#8b5cf6" />
          </View>
          <Text style={styles.statNumber}>34.2%</Text>
          <Text style={styles.statLabel}>Profit Margin</Text>
          <Text style={styles.statChange}>+5% from last month</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <TouchableOpacity style={styles.actionButton} onPress={navigateToScan}>
          <View style={styles.actionIcon}>
            <Ionicons name="camera" size={24} color="#ffffff" />
          </View>
          <Text style={styles.actionText}>Scan New Book</Text>
          <Ionicons name="chevron-forward" size={20} color="#6b7280" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={navigateToInventory}>
          <View style={styles.actionIcon}>
            <Ionicons name="library" size={24} color="#ffffff" />
          </View>
          <Text style={styles.actionText}>View Inventory</Text>
          <Ionicons name="chevron-forward" size={20} color="#6b7280" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={navigateToAnalytics}>
          <View style={styles.actionIcon}>
            <Ionicons name="analytics" size={24} color="#ffffff" />
          </View>
          <Text style={styles.actionText}>Analytics Report</Text>
          <Ionicons name="chevron-forward" size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>

      {/* Recent Activity */}
      <View style={styles.activityContainer}>
        <Text style={styles.sectionTitle}>Recent Scans</Text>
        
        {[
          { title: "The Great Gatsby", isbn: "978-0743273565", price: "$45.00", time: "2 hours ago" },
          { title: "To Kill a Mockingbird", isbn: "978-0446310789", price: "$38.00", time: "4 hours ago" },
          { title: "1984", isbn: "978-0451524935", price: "$32.00", time: "6 hours ago" },
        ].map((book, index) => (
          <TouchableOpacity
            key={index}
            style={styles.activityItem}
            onPress={navigateToInventory}
          >
            <View style={styles.activityIcon}>
              <Ionicons name="camera" size={16} color="#10b981" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>{book.title}</Text>
              <Text style={styles.activitySubtitle}>ISBN: {book.isbn}</Text>
            </View>
            <View style={styles.activityRight}>
              <Text style={styles.activityPrice}>{book.price}</Text>
              <Text style={styles.activityTime}>{book.time}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGlow: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10b981',
    opacity: 0.8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: '1%',
    borderWidth: 1,
    borderColor: '#374151',
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  statChange: {
    fontSize: 10,
    color: '#10b981',
  },
  actionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  activityContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  activityRight: {
    alignItems: 'flex-end',
  },
  activityPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#10b981',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 10,
    color: '#6b7280',
  },
});
