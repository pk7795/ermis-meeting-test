import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { map } from 'lodash';

type Props = {
  renderItem?: (item: any) => React.ReactNode;
  items: any[];
};

const SLIDE_PER_VIEW = 25;

export const GridViewLayout: React.FC<Props> = ({ items, renderItem }) => {
  const totalUser = items.length;

  // The column is based on the square root of n, capped at 5
  const columns = Math.ceil(Math.sqrt(totalUser)) > 5 ? 5 : Math.ceil(Math.sqrt(totalUser));

  // Rows are based on dividing numbers evenly in rows
  const rows = Math.ceil(totalUser / columns);

  // Calculate the number of extra elements
  const leftoverItems = totalUser % columns;

  // Check if we have full rows
  const checkFullRow = columns * rows === totalUser;

  // Get screen dimensions
  const { width, height } = Dimensions.get('window');

  // Calculate item dimensions based on available space
  const itemWidth = (width - (columns + 1) * 8) / columns;
  const itemHeight = (height - (rows + 1) * 8) / rows;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.grid,
          { flexDirection: 'row', flexWrap: 'wrap' }
        ]}
      >
        {map(items, (item, index) => {
          const isLeftover = index >= totalUser - leftoverItems;

          // Calculate offset for leftover items to center them
          const offset = leftoverItems > 0 && isLeftover && !checkFullRow
            ? { marginLeft: (columns - leftoverItems) * itemWidth / (2 * leftoverItems) }
            : {};

          return (
            <View
              key={index}
              style={[
                styles.itemContainer,
                {
                  width: itemWidth,
                  height: itemHeight,
                  margin: 4,
                },
                offset
              ]}
            >
              {renderItem?.(item) || item}
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  grid: {
    flex: 1,
    padding: 4,
    justifyContent: 'center',
  },
  itemContainer: {
    overflow: 'hidden',
    borderRadius: 8,
    backgroundColor: 'transparent',
  }
});