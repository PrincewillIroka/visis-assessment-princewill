import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { BOOK_DETAILS } from "@/constants/BooksDetails";
import BookType from "@/types";
import {
  CameraView,
  useCameraPermissions,
  CameraCapturedPicture,
} from "expo-camera";

export default function HomeScreen() {
  const [isScanning, setIsScanning] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [camera, setCamera] = useState<CameraView | null>(null);
  const [capturedImage, setCapturedImage] = useState("");

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
    <ScrollView>
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
              resizeMode="cover"
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
  layoutContainer: {
    padding: 10,
  },
  topSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  cameraView: {
    height: 200,
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
