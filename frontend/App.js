import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Button,
  TextInput,
  Alert,
  TouchableOpacity,
  Modal,
} from "react-native";

export default function App() {
  const [students, setStudents] = useState([]);
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentAge, setNewStudentAge] = useState("");
  const [editingStudent, setEditingStudent] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    fetch("http://192.168.196.68:1930/api/students")
      .then((response) => response.json())
      .then((data) => {
        setStudents(data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  const createStudent = () => {
    fetch("http://192.168.196.68:1930/api/students", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: newStudentName,
        age: parseInt(newStudentAge),
      }),
    })
      .then((response) => {
        if (response.ok) {
          Alert.alert("Success", "Student added successfully");
          return response.json();
        } else {
          throw new Error("Failed to add student");
        }
      })
      .then((data) => {
        setStudents([...students, data]);
        setNewStudentName("");
        setNewStudentAge("");
      })
      .catch((error) => {
        console.error("Error creating student:", error);
        Alert.alert("Error", "Failed to add student");
      });
  };

  const deleteStudent = (id) => {
    fetch(`http://192.168.196.68:1930/api/students/${id}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (response.ok) {
          Alert.alert("Success", "Student deleted successfully");
          setStudents(students.filter((student) => student.id !== id));
        } else {
          throw new Error("Failed to delete student");
        }
      })
      .catch((error) => {
        console.error("Error deleting student:", error);
        Alert.alert("Error", "Failed to delete student");
      });
  };

  const openEditModal = (student) => {
    setEditingStudent(student);
    setIsModalVisible(true);
  };

  const saveEditedStudent = () => {
    fetch(`http://192.168.196.68:1930/api/students/${editingStudent._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(editingStudent),
    })
      .then((response) => {
        if (response.ok) {
          Alert.alert("Success", "Student updated successfully");
          setStudents((prevStudents) =>
            prevStudents.map((student) =>
              student._id === editingStudent._id ? editingStudent : student,
            ),
          );
          setIsModalVisible(false);
        } else {
          throw new Error("Failed to update student");
        }
      })
      .catch((error) => {
        console.error("Error updating student:", error);
        Alert.alert("Error", "Failed to update student");
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>List of Students</Text>
      <FlatList
        data={students}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.studentContainer}>
            <View style={styles.studentInfo}>
              <Text style={styles.name}>Name: {item.name}</Text>
              <Text style={styles.age}>Age: {item.age}</Text>
            </View>
            <View style={styles.buttonsContainer}>
              <TouchableOpacity onPress={() => deleteStudent(item.id)}>
                <Text style={styles.deleteButton}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => openEditModal(item)}>
                <Text style={styles.editButton}>Edit</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Edit Student</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter name"
              value={editingStudent ? editingStudent.name : ""}
              onChangeText={(text) =>
                setEditingStudent({ ...editingStudent, name: text })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Enter age"
              keyboardType="numeric"
              value={editingStudent ? editingStudent.age.toString() : ""}
              onChangeText={(text) =>
                setEditingStudent({
                  ...editingStudent,
                  age: parseInt(text) || 0,
                })
              }
            />
            <Button
              title="Save"
              onPress={saveEditedStudent}
              style={styles.saveButton}
            />
            <Button
              title="Cancel"
              onPress={() => setIsModalVisible(false)}
              style={styles.cancelButton}
            />
          </View>
        </View>
      </Modal>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Enter name"
          value={newStudentName}
          onChangeText={(text) => setNewStudentName(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter age"
          keyboardType="numeric"
          value={newStudentAge}
          onChangeText={(text) => setNewStudentAge(text)}
        />
        <Button title="Create Student" onPress={createStudent} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  student: {
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    padding: 15,
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  age: {
    fontSize: 16,
  },
  deleteButton: {
    color: "red",
    fontWeight: "bold",
    marginTop: 5,
    marginBottom: 5,
    textAlign: "right",
    marginRight: 10,
  },
  editButton: {
    color: "blue",
    fontWeight: "bold",
    marginTop: 5,
    marginBottom: 5,
    textAlign: "right",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 5,
    width: "80%",
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  form: {
    marginTop: 20,
  },
  studentContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    padding: 15,
    marginBottom: 10,
  },
  studentInfo: {
    flex: 1,
  },
  buttonsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "green",
    color: "white",
    fontWeight: "bold",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    marginTop: 5,
  },
  cancelButton: {
    backgroundColor: "red",
    color: "white",
    fontWeight: "bold",
    padding: 10,
    borderRadius: 5,
  },
});
