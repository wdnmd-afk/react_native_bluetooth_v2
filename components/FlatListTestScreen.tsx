import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ScrollView,
} from 'react-native';

interface Props {
  onBack: () => void;
}

interface Item {
  id: string;
  title: string;
  description: string;
  index?: number;
}

export default function FlatListTestScreen({ onBack }: Props) {
  const flatListRef = useRef<FlatList>(null);

  // 初始数据
  const [data, setData] = useState<Item[]>(() => 
    Array.from({ length: 100 }, (_, i) => ({
      id: `item-${i}`,
      title: `项目 ${i + 1}`,
      description: `这是第 ${i + 1} 个项目的描述`,
      index: i,
    }))
  );

  // FlatList 配置状态
  const [config, setConfig] = useState({
    horizontal: false,
    numColumns: 1,
    inverted: false,
    showsVerticalScrollIndicator: true,
    showsHorizontalScrollIndicator: true,
    bounces: true,
    windowSize: 21,
    maxToRenderPerBatch: 10,
    initialNumToRender: 10,
    updateCellsBatchingPeriod: 50,
    removeClippedSubviews: false,
  });

  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // 渲染单个项目
  const renderItem = useCallback(({ item, index }: { item: Item; index: number }) => (
    <TouchableOpacity
      style={[
        styles.itemContainer,
        config.horizontal && styles.horizontalItemContainer,
        config.numColumns > 1 && styles.gridItemContainer,
      ]}
      onPress={() => Alert.alert('项目点击', `点击了 ${item.title}`)}
    >
      <Text style={styles.itemTitle}>{item.title}</Text>
      <Text style={styles.itemDescription}>{item.description}</Text>
      <Text style={styles.itemIndex}>索引: {index}</Text>
    </TouchableOpacity>
  ), [config.horizontal, config.numColumns]);

  // 项目分隔符
  const ItemSeparator = useCallback(() => (
    <View style={styles.separator} />
  ), []);

  // 头部组件
  const ListHeader = useCallback(() => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerText}>FlatList 头部</Text>
    </View>
  ), []);

  // 尾部组件
  const ListFooter = useCallback(() => (
    <View style={styles.footerContainer}>
      <Text style={styles.footerText}>
        {loadingMore ? '加载更多...' : 'FlatList 尾部'}
      </Text>
    </View>
  ), [loadingMore]);

  // 空列表组件
  const EmptyComponent = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>没有数据</Text>
    </View>
  ), []);

  // 下拉刷新
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setData(prev => prev.map(item => ({
        ...item,
        title: `刷新 ${item.title}`,
      })));
      setRefreshing(false);
    }, 2000);
  }, []);

  // 加载更多
  const onEndReached = useCallback(() => {
    if (!loadingMore) {
      setLoadingMore(true);
      setTimeout(() => {
        const newItems = Array.from({ length: 20 }, (_, i) => ({
          id: `new-item-${data.length + i}`,
          title: `新项目 ${data.length + i + 1}`,
          description: `这是新加载的第 ${data.length + i + 1} 个项目`,
          index: data.length + i,
        }));
        setData(prev => [...prev, ...newItems]);
        setLoadingMore(false);
      }, 1500);
    }
  }, [loadingMore, data.length]);

  // 获取项目布局
  const getItemLayout = useCallback((data: any, index: number) => ({
    length: config.horizontal ? 200 : 80,
    offset: (config.horizontal ? 200 : 80) * index,
    index,
  }), [config.horizontal]);

  // 按钮操作
  const scrollToTop = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const scrollToEnd = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  const scrollToIndex = () => {
    flatListRef.current?.scrollToIndex({ index: 50, animated: true });
  };

  const addItem = () => {
    const newItem = {
      id: `added-${Date.now()}`,
      title: `添加的项目 ${data.length + 1}`,
      description: '动态添加的项目',
      index: data.length,
    };
    setData(prev => [newItem, ...prev]);
  };

  const removeItem = () => {
    setData(prev => prev.slice(1));
  };

  const clearData = () => {
    setData([]);
  };

  const resetData = () => {
    setData(Array.from({ length: 100 }, (_, i) => ({
      id: `item-${i}`,
      title: `项目 ${i + 1}`,
      description: `这是第 ${i + 1} 个项目的描述`,
      index: i,
    })));
  };

  const toggleConfig = (key: keyof typeof config) => {
    setConfig(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }));
  };

  const setNumColumns = (num: number) => {
    setConfig(prev => ({ ...prev, numColumns: num }));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 头部控制面板 */}
      <View style={styles.headerSection}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={onBack}
        >
          <Text style={styles.backButtonText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.title}>FlatList 测试</Text>
        <TouchableOpacity 
          style={styles.infoButton}
          onPress={() => Alert.alert('FlatList 说明', 
            'FlatList 是 React Native 中用于高效渲染长列表的组件\n\n' +
            '主要优势:\n' +
            '• 虚拟化渲染，只渲染可见项目\n' +
            '• 支持下拉刷新和无限滚动\n' +
            '• 可配置的性能参数\n' +
            '• 支持水平和垂直滚动\n\n' +
            '性能优化技巧:\n' +
            '• 使用 getItemLayout 提升性能\n' +
            '• 使用 keyExtractor 提供稳定的键\n' +
            '• 合理设置 windowSize 等参数\n' +
            '• 使用 removeClippedSubviews 节省内存'
          )}
        >
          <Text style={styles.infoButtonText}>ℹ️ 说明</Text>
        </TouchableOpacity>
      </View>

      {/* 控制按钮区域 */}
      <ScrollView style={styles.controlPanel} horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity style={styles.controlButton} onPress={scrollToTop}>
          <Text style={styles.controlButtonText}>滚动到顶部</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={scrollToEnd}>
          <Text style={styles.controlButtonText}>滚动到底部</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={scrollToIndex}>
          <Text style={styles.controlButtonText}>滚动到索引50</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={addItem}>
          <Text style={styles.controlButtonText}>添加项目</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={removeItem}>
          <Text style={styles.controlButtonText}>删除首项</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={clearData}>
          <Text style={styles.controlButtonText}>清空数据</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={resetData}>
          <Text style={styles.controlButtonText}>重置数据</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 配置开关 */}
      <ScrollView style={styles.configPanel} horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity 
          style={[styles.configButton, config.horizontal && styles.activeConfig]}
          onPress={() => toggleConfig('horizontal')}
        >
          <Text style={styles.configButtonText}>水平滚动</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.configButton, config.inverted && styles.activeConfig]}
          onPress={() => toggleConfig('inverted')}
        >
          <Text style={styles.configButtonText}>反向滚动</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.configButton, config.removeClippedSubviews && styles.activeConfig]}
          onPress={() => toggleConfig('removeClippedSubviews')}
        >
          <Text style={styles.configButtonText}>移除剪切视图</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.configButton, config.numColumns === 2 && styles.activeConfig]}
          onPress={() => setNumColumns(config.numColumns === 2 ? 1 : 2)}
        >
          <Text style={styles.configButtonText}>双列布局</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* FlatList 组件 */}
      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={ItemSeparator}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        ListEmptyComponent={EmptyComponent}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.1}
        getItemLayout={getItemLayout}
        horizontal={config.horizontal}
        numColumns={config.numColumns}
        inverted={config.inverted}
        showsVerticalScrollIndicator={config.showsVerticalScrollIndicator}
        showsHorizontalScrollIndicator={config.showsHorizontalScrollIndicator}
        bounces={config.bounces}
        windowSize={config.windowSize}
        maxToRenderPerBatch={config.maxToRenderPerBatch}
        initialNumToRender={config.initialNumToRender}
        updateCellsBatchingPeriod={config.updateCellsBatchingPeriod}
        removeClippedSubviews={config.removeClippedSubviews}
        style={styles.flatList}
        contentContainerStyle={styles.flatListContent}
      />

      {/* 底部信息面板 */}
      <View style={styles.infoPanel}>
        <Text style={styles.infoText}>当前项目数: {data.length}</Text>
        <Text style={styles.infoText}>列数: {config.numColumns}</Text>
        <Text style={styles.infoText}>
          方向: {config.horizontal ? '水平' : '垂直'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 60,
    backgroundColor: '#1e293b',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '500',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
  },
  infoButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  infoButtonText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
  controlPanel: {
    backgroundColor: '#1e293b',
    paddingVertical: 8,
    paddingHorizontal: 8,
    maxHeight: 50,
  },
  controlButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  controlButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  configPanel: {
    backgroundColor: '#1e293b',
    paddingVertical: 8,
    paddingHorizontal: 8,
    maxHeight: 50,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  configButton: {
    backgroundColor: '#475569',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeConfig: {
    backgroundColor: '#10b981',
  },
  configButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  flatList: {
    flex: 1,
  },
  flatListContent: {
    paddingHorizontal: 16,
  },
  itemContainer: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 8,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  horizontalItemContainer: {
    width: 200,
    marginHorizontal: 8,
  },
  gridItemContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 8,
  },
  itemIndex: {
    fontSize: 12,
    color: '#64748b',
  },
  separator: {
    height: 8,
  },
  headerContainer: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  footerContainer: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#64748b',
    fontWeight: '500',
  },
  infoPanel: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  infoText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
});