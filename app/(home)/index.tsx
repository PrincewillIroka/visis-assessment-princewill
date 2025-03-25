import { View, Text, StyleSheet, ScrollView } from "react-native";
import { BOOK_DETAILS } from "@/constants/BooksDetails";
import BookType from "@/types";

export default function HomeScreen() {
  return (
    <ScrollView>
      <View style={styles.bookContainer}>
        {BOOK_DETAILS.map(
          ({ title, author, summary }: BookType, index: number) => (
            <View style={styles.bookCol} key={index}>
              <View style={styles.bookRow}>
                <Text style={styles.bookHeader}>Title:</Text>
                <Text style={styles.bookItem}>{title}</Text>
              </View>
              <View style={styles.bookRow}>
                <Text style={styles.bookHeader}>Author:</Text>
                <Text style={styles.bookItem}>{author}</Text>
              </View>
              <View>
                <Text style={styles.bookHeader}>Summary:</Text>
                <Text style={styles.bookItem}>{summary}</Text>
              </View>
            </View>
          )
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bookContainer: {
    padding: 10,
  },
  bookCol: {
    display: "flex",
    flexDirection: "column",
    marginBottom: 15,
    backgroundColor: "#ffffff",
    width: "100%",
    padding: 10,
  },
  bookRow: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    marginBottom: 5,
  },
  bookHeader: {
    fontWeight: "bold",
    marginRight: 5,
  },
  bookItem: {},
});
