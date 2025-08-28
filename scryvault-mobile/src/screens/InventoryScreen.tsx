import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function InventoryScreen() {
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Inventory</Text>
        <Text style={styles.subtitle}>Manage your book collection</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="library" size={20} color="#10b981" />
          </View>
          <Text style={styles.statNumber}>1,247</Text>
          <Text style={styles.statLabel}>Total Books</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="trending-up" size={20} color="#3b82f6" />
          </View>
          <Text style={styles.statNumber}>892</Text>
          <Text style={styles.statLabel}>Listed</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
          </View>
          <Text style={styles.statNumber}>355</Text>
          <Text style={styles.statLabel}>Sold</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="cash" size={20} color="#8b5cf6" />
          </View>
          <Text style={styles.statNumber}>$45,230</Text>
          <Text style={styles.statLabel}>Total Value</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#6b7280" />
          <Text style={styles.searchPlaceholder}>Search books...</Text>
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter" size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>

      {/* Inventory List */}
      <View style={styles.inventoryContainer}>
        <Text style={styles.sectionTitle}>Recent Books</Text>
        
        {[
          {
            title: "The Great Gatsby",
            author: "F. Scott Fitzgerald",
            isbn: "978-0743273565",
            status: "Listed",
            listPrice: "$45.00",
            cogs: "$12.00",
            profit: "$33.00",
            profitMargin: "73%"
          },
          {
            title: "To Kill a Mockingbird",
            author: "Harper Lee",
            isbn: "978-0446310789",
            status: "Sold",
            listPrice: "$38.00",
            cogs: "$8.00",
            profit: "$30.00",
            profitMargin: "79%"
          },
          {
            title: "1984",
            author: "George Orwell",
            isbn: "978-0451524935",
            status: "Listed",
            listPrice: "$32.00",
            cogs: "$6.00",
            profit: "$26.00",
            profitMargin: "81%"
          },
          {
            title: "Pride and Prejudice",
            author: "Jane Austen",
            isbn: "978-0141439518",
            status: "Draft",
            listPrice: "$28.00",
            cogs: "$5.00",
            profit: "$23.00",
            profitMargin: "82%"
          },
          {
            title: "The Hobbit",
            author: "J.R.R. Tolkien",
            isbn: "978-0547928241",
            status: "Listed",
            listPrice: "$42.00",
            cogs: "$10.00",
            profit: "$32.00",
            profitMargin: "76%"
          }
        ].map((book, index) => (
          <View key={index} style={styles.bookItem}>
            <View style={styles.bookHeader}>
              <View style={styles.bookInfo}>
                <Text style={styles.bookTitle}>{book.title}</Text>
                <Text style={styles.bookAuthor}>{book.author}</Text>
                <Text style={styles.bookIsbn}>ISBN: {book.isbn}</Text>
              </View>
              <View style={styles.statusContainer}>
                <View style={[
                  styles.statusBadge,
                  book.status === 'Listed' && styles.statusListed,
                  book.status === 'Sold' && styles.statusSold,
                  book.status === 'Draft' && styles.statusDraft,
                ]}>
                  <Text style={[
                    styles.statusText,
                    book.status === 'Listed' && styles.statusTextListed,
                    book.status === 'Sold' && styles.statusTextSold,
                    book.status === 'Draft' && styles.statusTextDraft,
                  ]}>
                    {book.status}
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.bookDetails}>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>List Price:</Text>
                <Text style={styles.priceValue}>{book.listPrice}</Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>COGS:</Text>
                <Text style={styles.priceValue}>{book.cogs}</Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Profit:</Text>
                <Text style={styles.profitValue}>{book.profit}</Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Margin:</Text>
                <Text style={styles.marginValue}>{book.profitMargin}</Text>
              </View>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="eye" size={16} color="#6b7280" />
                <Text style={styles.actionText}>View</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="create" size={16} color="#6b7280" />
                <Text style={styles.actionText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="trash" size={16} color="#ef4444" />
                <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {/* Load More */}
      <TouchableOpacity style={styles.loadMoreButton}>
        <Text style={styles.loadMoreText}>Load More Books</Text>
        <Ionicons name="chevron-down" size={20} color="#10b981" />
      </TouchableOpacity>
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
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#374151',
    marginRight: 12,
  },
  searchPlaceholder: {
    color: '#6b7280',
    fontSize: 16,
    marginLeft: 12,
  },
  filterButton: {
    width: 44,
    height: 44,
    backgroundColor: '#1f2937',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  inventoryContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  bookItem: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  bookHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bookInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 2,
  },
  bookIsbn: {
    fontSize: 12,
    color: '#6b7280',
  },
  statusContainer: {
    marginLeft: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusListed: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  statusSold: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  statusDraft: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  statusTextListed: {
    color: '#3b82f6',
  },
  statusTextSold: {
    color: '#10b981',
  },
  statusTextDraft: {
    color: '#f59e0b',
  },
  bookDetails: {
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  priceLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  priceValue: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '500',
  },
  profitValue: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
  },
  marginValue: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#374151',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  deleteText: {
    color: '#ef4444',
  },
  loadMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#374151',
  },
  loadMoreText: {
    fontSize: 16,
    color: '#10b981',
    fontWeight: '500',
    marginRight: 8,
  },
});
