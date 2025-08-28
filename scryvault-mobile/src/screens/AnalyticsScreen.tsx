import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function AnalyticsScreen() {
  const navigation = useNavigation();

  const navigateToInventory = () => {
    navigation.navigate('Inventory');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
        <Text style={styles.subtitle}>Track your business performance</Text>
      </View>

      {/* Analytics Overview */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="cash" size={20} color="#10b981" />
          </View>
          <Text style={styles.statNumber}>$45,230</Text>
          <Text style={styles.statLabel}>Total Revenue</Text>
          <Text style={styles.statChange}>+23% from last month</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="library" size={20} color="#3b82f6" />
          </View>
          <Text style={styles.statNumber}>355</Text>
          <Text style={styles.statLabel}>Books Sold</Text>
          <Text style={styles.statChange}>+12% from last month</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="trending-up" size={20} color="#8b5cf6" />
          </View>
          <Text style={styles.statNumber}>$127</Text>
          <Text style={styles.statLabel}>Avg. Sale Price</Text>
          <Text style={styles.statChange}>+8% from last month</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="analytics" size={20} color="#06b6d4" />
          </View>
          <Text style={styles.statNumber}>28.5%</Text>
          <Text style={styles.statLabel}>Conversion Rate</Text>
          <Text style={styles.statChange}>+5% from last month</Text>
        </View>
      </View>

      {/* Chart Placeholder */}
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>Revenue Trend</Text>
        <View style={styles.chartPlaceholder}>
          <Ionicons name="analytics" size={48} color="#6b7280" />
          <Text style={styles.chartPlaceholderText}>Chart coming soon</Text>
        </View>
      </View>

      {/* Top Performing Books */}
      <View style={styles.performanceContainer}>
        <Text style={styles.sectionTitle}>Top Performing Books</Text>
        
        {[
          { title: "The Great Gatsby", sales: 45, revenue: "$2,025" },
          { title: "To Kill a Mockingbird", sales: 38, revenue: "$1,444" },
          { title: "1984", sales: 32, revenue: "$1,024" },
          { title: "Pride and Prejudice", sales: 28, revenue: "$784" },
        ].map((book, index) => (
          <TouchableOpacity
            key={index}
            style={styles.performanceItem}
            onPress={navigateToInventory}
          >
            <View style={styles.rankContainer}>
              <Text style={styles.rankText}>#{index + 1}</Text>
            </View>
            <View style={styles.bookInfo}>
              <Text style={styles.bookTitle}>{book.title}</Text>
              <Text style={styles.bookSales}>{book.sales} sales</Text>
            </View>
            <View style={styles.revenueContainer}>
              <Text style={styles.revenueText}>{book.revenue}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent Sales */}
      <View style={styles.salesContainer}>
        <Text style={styles.sectionTitle}>Recent Sales</Text>
        
        {[
          { title: "The Great Gatsby", price: "$45.00", time: "2 hours ago", status: "Completed" },
          { title: "To Kill a Mockingbird", price: "$38.00", time: "4 hours ago", status: "Completed" },
          { title: "1984", price: "$32.00", time: "6 hours ago", status: "Completed" },
          { title: "Pride and Prejudice", price: "$28.00", time: "8 hours ago", status: "Completed" },
        ].map((sale, index) => (
          <TouchableOpacity
            key={index}
            style={styles.saleItem}
            onPress={navigateToInventory}
          >
            <View style={styles.saleIcon}>
              <Ionicons name="cash" size={16} color="#10b981" />
            </View>
            <View style={styles.saleContent}>
              <Text style={styles.saleTitle}>{sale.title}</Text>
              <Text style={styles.saleTime}>{sale.time}</Text>
            </View>
            <View style={styles.saleRight}>
              <Text style={styles.salePrice}>{sale.price}</Text>
              <Text style={styles.saleStatus}>{sale.status}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Performance Metrics */}
      <View style={styles.metricsContainer}>
        <Text style={styles.sectionTitle}>Performance Metrics</Text>
        
        <View style={styles.metricRow}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Profit Margin</Text>
            <Text style={styles.metricValue}>34.2%</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Avg. Time to Sell</Text>
            <Text style={styles.metricValue}>12 days</Text>
          </View>
        </View>
        
        <View style={styles.metricRow}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Customer Rating</Text>
            <Text style={styles.metricValue}>4.8/5</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Return Rate</Text>
            <Text style={styles.metricValue}>2.1%</Text>
          </View>
        </View>
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
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
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
    fontSize: 20,
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
  chartContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  chartPlaceholder: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  chartPlaceholderText: {
    color: '#6b7280',
    fontSize: 16,
    marginTop: 12,
  },
  performanceContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  performanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  rankContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bookInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 2,
  },
  bookSales: {
    fontSize: 12,
    color: '#6b7280',
  },
  revenueContainer: {
    alignItems: 'flex-end',
  },
  revenueText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10b981',
  },
  salesContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  saleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  saleIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  saleContent: {
    flex: 1,
  },
  saleTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 2,
  },
  saleTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  saleRight: {
    alignItems: 'flex-end',
  },
  salePrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#10b981',
    marginBottom: 2,
  },
  saleStatus: {
    fontSize: 10,
    color: '#6b7280',
  },
  metricsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  metricRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  metricItem: {
    flex: 1,
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#374151',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});
