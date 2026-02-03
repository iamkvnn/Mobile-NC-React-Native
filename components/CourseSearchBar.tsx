/**
 * Course Search Bar Component
 * Search input with debounce functionality
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';

interface CourseSearchBarProps {
  value: string;
  onSearch: (query: string) => void;
  onClear: () => void;
  placeholder?: string;
  debounceMs?: number;
}

const CourseSearchBar: React.FC<CourseSearchBarProps> = ({
  value,
  onSearch,
  onClear,
  placeholder = "Tìm kiếm khóa học...",
  debounceMs = 500,
}) => {
  const [searchText, setSearchText] = useState(value);

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchText !== value) {
        onSearch(searchText);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [searchText, debounceMs, onSearch, value]);

  // Update local state when external value changes
  useEffect(() => {
    setSearchText(value);
  }, [value]);

  const handleClear = () => {
    setSearchText('');
    onClear();
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchText}
          onChangeText={setSearchText}
          placeholder={placeholder}
          placeholderTextColor="#999"
          returnKeyType="search"
          onSubmitEditing={() => onSearch(searchText)}
        />
        
        {searchText.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 12,
  },
  clearButton: {
    padding: 8,
    marginLeft: 8,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#999',
  },
});

export default CourseSearchBar;