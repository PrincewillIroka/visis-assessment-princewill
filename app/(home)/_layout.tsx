import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import {
  CameraView,
  useCameraPermissions,
  CameraCapturedPicture,
} from "expo-camera";

const apiKey = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

export default function HomeScreen() {
  const [isScanning, setIsScanning] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [camera, setCamera] = useState<CameraView | null>(null);
  const [capturedImage, setCapturedImage] = useState("");
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [bookText, setBookText] = useState("No book here");

  const getBookInfo = async (searchQuery: string) => {
    let query = encodeURIComponent(searchQuery.trim());
    await fetch(
      `https://www.googleapis.com/books/v1/volumes?key=${apiKey}&q=${query}&maxResults=20`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((res) => res.json())
      .then(({ items = [] }) => {
        setItems(items);
        setIsLoading(false);
        if (!items.length) {
          setBookText("No books found");
        }
      })
      .catch((e) => {
        console.error("Error fetching book info:", e);
        setIsLoading(false);
        setBookText("Error fetching book info. Please try again!");
      });
  };

  const detectText = async (uri: string) => {
    setIsLoading(true);
    setBookText("");

    const body = {
      requests: [
        {
          image: { content: uri },
          features: [{ type: "TEXT_DETECTION" }],
        },
      ],
    };
    const errorText = "Error detecting text from image. Please try again!";

    await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: "POST",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
      }
    )
      .then(async (res) => await res.json())
      .then(({ responses = [] }) => {
        const text = responses[0]?.fullTextAnnotation?.text || "";
        if (text) {
          getBookInfo(text);
        } else {
          console.log("No text found");
          setIsLoading(false);
          setBookText(errorText);
        }
      })
      .catch((e) => {
        console.error("Error detecting text:", e);
        setIsLoading(false);
        setBookText(errorText);
      });
  };

  const processImage = async (uri: string) => {
    let base64Image = await fetch(uri)
      .then((res) => res.blob())
      .then(
        (blob) =>
          new Promise((resolve) => {
            let reader = new FileReader();
            reader.onloadend = () => {
              if (reader.result) {
                if (typeof reader.result === "string") {
                  resolve(reader.result.split(",")[1]);
                } else {
                  resolve(null);
                }
              } else {
                resolve(null);
              }
            };
            reader.readAsDataURL(blob);
          })
      )
      .catch((e) => {
        console.error("Error fetching image:", e);
        return null;
      });

    if (typeof base64Image === "string") {
      detectText(base64Image);
    } else {
      console.log("Failed to convert image to base64 string.");
    }
  };

  const takePicture = async () => {
    try {
      if (camera) {
        const picture = (await camera.takePictureAsync(
          {}
        )) as CameraCapturedPicture;

        if (!picture || !picture?.uri) {
          throw new Error("Failed to capture picture or uri is missing.");
        } else {
          setCapturedImage(picture.uri);
          setIsScanning(false);
          processImage(picture.uri);
        }
      }
    } catch (e) {
      console.error("Error taking picture:", e);
    }
  };

  const handleBookScan = () => {
    if (!cameraPermission) {
      requestCameraPermission();
    } else if (!isScanning) {
      setIsScanning(true);
      setCapturedImage("");
    } else {
      takePicture();
    }
  };

  return (
    <View style={styles.layoutContainer}>
      <View style={styles.topSection}>
        {cameraPermission && isScanning ? (
          <CameraView
            style={styles.cameraView}
            ref={(ref) => setCamera(ref)}
          ></CameraView>
        ) : capturedImage ? (
          <Image
            style={styles.cameraView}
            source={{ uri: capturedImage }}
            resizeMode="contain"
          />
        ) : null}
        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => handleBookScan()}
        >
          <Text style={styles.scanButtonText}>
            {capturedImage
              ? "Rescan Book Cover"
              : isScanning
              ? "Capture"
              : "Scan Book Cover"}
          </Text>
        </TouchableOpacity>
      </View>
      <ScrollView>
        <View>
          {isLoading ? (
            <View style={styles.emptyBooks}>
              <ActivityIndicator size="large" color="#0e86d4" />
            </View>
          ) : !isLoading && !items.length ? (
            <View style={styles.emptyBooks}>
              <Text style={styles.emptyBooksText}>{bookText}</Text>
            </View>
          ) : (
            items.map(({ volumeInfo }, index: number) => {
              const { title, authors = [], description } = volumeInfo || {};
              return (
                <View style={styles.bookCol} key={index}>
                  <View style={styles.bookRow}>
                    <Text style={styles.bookHeader}>Title:</Text>
                    <Text
                      style={styles.bookItem}
                      ellipsizeMode="tail"
                      numberOfLines={1}
                    >
                      {title}
                    </Text>
                  </View>
                  <View style={styles.bookRow}>
                    <Text style={styles.bookHeader}>Author:</Text>
                    <View style={styles.bookAuthorsRow}>
                      {authors.map((author, i) => (
                        <Text key={i} style={styles.bookAuthor}>
                          {author}
                          {i < authors.length - 1 ? "," : ""}
                        </Text>
                      ))}
                    </View>
                  </View>
                  <View>
                    <Text style={styles.bookHeader}>Summary:</Text>
                    <Text
                      style={styles.bookItem}
                      ellipsizeMode="tail"
                      numberOfLines={5}
                    >
                      {description}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  layoutContainer: {
    padding: 10,
    backgroundColor: "#f0f0f0",
    flex: 1,
  },
  topSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  cameraView: {
    height: 150,
    width: "90%",
    position: "relative",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  scanButton: {
    marginBottom: 20,
    marginHorizontal: "auto",
    height: 40,
    width: 160,
    backgroundColor: "#0e86d4",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
  },
  scanButtonText: {
    color: "#ffffff",
    fontSize: 16,
  },
  emptyBooks: {
    height: 400,
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyBooksText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  bookCol: {
    display: "flex",
    flexDirection: "column",
    marginBottom: 15,
    backgroundColor: "#ffffff",
    width: "100%",
    padding: 10,
    borderRadius: 5,
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 1,
    elevation: 2,
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
  bookAuthorsRow: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  bookAuthor: {
    marginRight: 5,
  },
  bookItem: {},
});
