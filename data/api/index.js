import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import { MongoClient } from "mongodb";

/* Be sure to use DATABASE_NAME in your call to .db(), so we can change the constant while grading. */
let DATABASE_NAME = "cs193x_assign3";
let DATABASE_URL = "mongodb://127.0.0.1";

/* Do not modify or remove this line. It allows us to change the database for grading */
if (process.env.DATABASE_NAME) DATABASE_NAME = process.env.DATABASE_NAME;

let api = express.Router();

/* Khai báo biến students để để lưu trữ các collection từ MongoDB. */
let students;

const initApi = async (app) => {
  app.set("json spaces", 2);
  app.use("/api", api);

  //TODO: Set up database connection and collection variables
  let conn = await MongoClient.connect(DATABASE_URL);
  let db = conn.db(DATABASE_NAME);

  // Lưu trữ các collection vào biến students
  students = db.collection("students");
};

// Middleware to enable CORS and JSON parsing
api.use(bodyParser.json());
api.use(cors());

// const students = [
//   { id: 1, name: "John", age: 18 },
//   { id: 2, name: "Jane", age: 17 },
//   { id: 3, name: "Doe", age: 16 },
// ];

// Route để kiểm tra kết nối đến MongoDB
api.get("/", async (req, res) => {
  let studentsArray = await students.find({}).toArray();

  res.json({
    db: DATABASE_NAME,
    numStudents: studentsArray.length,
  });
});

// Route để lấy tất cả học sinh
api.get("/students", async (req, res) => {
  try {
    const studentsArray = await students.find().toArray();
    res.json(studentsArray);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ error: "Error fetching students" });
  }
});

let nextStudentId = 3;

// Route để tạo học sinh mới
api.post("/students", async (req, res) => {
  try {
    const newStudentData = req.body;
    newStudentData.id = nextStudentId++;
    let data = {
      id: (newStudentData.id = nextStudentId),
      name: newStudentData.name,
      age: newStudentData.age,
    };
    await students.insertOne(data);
    delete data._id;
    // res.json(data);

    res.status(201).json(data);
  } catch (error) {
    console.error("Error creating student:", error);
    res.status(500).json({ error: "Error creating student" });
  }
});

// Route để xóa học sinh
api.delete("/students/:id", async (req, res) => {
  try {
    const studentId = req.params.id;

    const result = await students.deleteOne({ id: parseInt(studentId) });

    if (result.deletedCount === 0) {
      res.status(404).json({ error: "Student not found" });
    } else {
      res.status(200).json({ message: "Student deleted successfully" });
    }
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json({ error: "Error deleting student" });
  }
});

// Route để cập nhật thông tin học sinh
api.put("/students/:id", async (req, res) => {
  try {
    const studentId = req.params.id;
    const updatedStudentData = req.body;

    const updatedStudent = await students.findOneAndUpdate(
      { id: studentId }, // Tìm học sinh bằng _id
      { $set: updatedStudentData }, // Dữ liệu được cập nhật
      { returnOriginal: false }, // Trả về dữ liệu đã được cập nhật
    );

    if (updatedStudent) {
      res.status(200).json({ message: "Student updated successfully" });
    } else {
      res.status(404).json({ error: "Student not found" });
    }
  } catch (error) {
    console.error("Error updating student:", error);
    res.status(500).json({ error: "Error updating student" });
  }
});

export default initApi;
