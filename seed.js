const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI =
  'mongodb+srv://vireakboth_db_user:8pTWCCjLYU2Osa5Z@schoolapplicationcluste.exbe9bc.mongodb.net/schoolDB?appName=SchoolApplicationCluster';

/* =======================
   SCHEMAS
======================= */

const teacherSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  profilePicture: String
});
const Teacher = mongoose.model('Teacher', teacherSchema, 'teachers');

const classroomSchema = new mongoose.Schema({
  name: String,
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  colorIdentifier: Number
});
const Classroom = mongoose.model('Classroom', classroomSchema, 'classrooms');

const studentSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  profilePicture: String,
  classesEnrolled: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Classroom' }]
});
const Student = mongoose.model('Student', studentSchema, 'students');

const materialSchema = new mongoose.Schema({
  title: String,
  fileUrl: String,
  fileType: String,
  uploaderName: String,
  uploadDate: { type: Date, default: Date.now },
  classroomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom' }
});
const Material = mongoose.model('Material', materialSchema, 'materials');

const assessmentSchema = new mongoose.Schema(
  {
    title: String,
    type: String,
    instructions: String,
    dueDate: Date,
    maxScore: Number,
    classroomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom' }
  },
  { timestamps: true } // ✅ REQUIRED
);
const Assessment = mongoose.model('Assessment', assessmentSchema, 'assessments');

const submissionSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true },
    submittedAt: { type: Date, default: Date.now },
    gradedAt: Date, // 👈 ADD THIS
    writtenAnswer: String,
    comment: String,
    score: Number,
    fileAttachments: [String]
  },
  { timestamps: true }
);

const Submission = mongoose.model('Submission', submissionSchema, 'submissions');

/* =======================
   SEED
======================= */

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    await Teacher.deleteMany({});
    await Student.deleteMany({});
    await Classroom.deleteMany({});
    await Material.deleteMany({});
    await Assessment.deleteMany({});
    await Submission.deleteMany({});

    const hashedPassword = await bcrypt.hash('password123', 10);

    /* ---------- TEACHERS ---------- */
    const teachers = await Teacher.create([
      { name: 'Mr. Lim', email: 'lim@school.com', password: hashedPassword },
      { name: 'Ms. Tan', email: 'tan@school.com', password: hashedPassword },
      { name: 'Mr. Cruz', email: 'cruz@school.com', password: hashedPassword },
      { name: 'Mrs. Reyes', email: 'reyes@school.com', password: hashedPassword },
      { name: 'Ms. Ortega', email: 'ortega@school.com', password: hashedPassword }
    ]);

    console.log('\n👨‍🏫 TEACHERS:');
    teachers.forEach(t =>
      console.log(`${t.name} | ${t.email} | id=${t._id}`)
    );


    /* ---------- STUDENTS ---------- */
    const students = await Student.create([
      { name: 'John Doe', email: 'john.doe@example.com', password: hashedPassword },
      { name: 'Jane Smith', email: 'jane.smith@example.com', password: hashedPassword },
      { name: 'Peter Jones', email: 'peter.jones@example.com', password: hashedPassword },
      { name: 'Mary Williams', email: 'mary.w@example.com', password: hashedPassword },
      { name: 'David Brown', email: 'd.brown@example.com', password: hashedPassword }
    ]);

    /* ---------- CLASSROOMS ---------- */
    const classrooms = await Classroom.create([
      { name: 'Mathematics', teacher: teachers[0]._id, colorIdentifier: -1114112 },
      { name: 'Science', teacher: teachers[1]._id, colorIdentifier: -12412199 },
      { name: 'English', teacher: teachers[2]._id, colorIdentifier: -13624 },
      { name: 'History', teacher: teachers[3]._id, colorIdentifier: -5552452 },
      { name: 'Computer Studies', teacher: teachers[4]._id, colorIdentifier: -14243430 }
    ]);

    console.log('\n🏫 CLASSROOMS:');
    classrooms.forEach(c =>
      console.log(`${c.name} | teacherId=${c.teacher}`)
    );


    /* ---------- ENROLL STUDENTS ---------- */
    for (const student of students) {
      student.classesEnrolled = classrooms.map(c => c._id);
      await student.save();
    }

    /* ---------- MATERIALS + ASSESSMENTS + SUBMISSIONS ---------- */
    for (const classroom of classrooms) {

      /* ----- MATERIALS (ALL FILE TYPES) ----- */
      await Material.create([
        {
          title: `${classroom.name} - Introduction to the Subject and Course Overview.pdf`,
          fileUrl: 'http://example.com/intro.pdf',
          fileType: 'PDF',
          uploaderName: 'Teacher',
          classroomId: classroom._id
        },
        {
          title: `${classroom.name} - Week 1 Slides.pptx`,
          fileUrl: 'http://example.com/week1.pptx',
          fileType: 'PPTX',
          uploaderName: 'Teacher',
          classroomId: classroom._id
        },
        {
          title: `${classroom.name} - Assignment Instructions.docx`,
          fileUrl: 'http://example.com/assignment.docx',
          fileType: 'DOCX',
          uploaderName: 'Teacher',
          classroomId: classroom._id
        },
        {
          title: `${classroom.name} - Diagram of Key Concepts.png`,
          fileUrl: 'http://example.com/diagram.png',
          fileType: 'IMAGE',
          uploaderName: 'Teacher',
          classroomId: classroom._id
        },
        {
          title: `${classroom.name} - Lecture Recording Week 1.mp4`,
          fileUrl: 'http://example.com/lecture.mp4',
          fileType: 'VIDEO',
          uploaderName: 'Teacher',
          classroomId: classroom._id
        },
        {
          title: `${classroom.name} - Extra Resources Archive.zip`,
          fileUrl: 'http://example.com/resources.zip',
          fileType: 'OTHER',
          uploaderName: 'Teacher',
          classroomId: classroom._id
        }
      ]);


      /* ----- ASSESSMENTS (7) ----- */
      const assessments = await Assessment.create([
      {
        title: 'Assignment 1',
        type: 'ASSIGNMENT',
        instructions: 'Complete the assignment as instructed.',
        maxScore: 20,
        dueDate: daysFromNow(3),
        classroomId: classroom._id
      },
      {
        title: 'Quiz 1',
        type: 'QUIZ',
        instructions: 'Answer all quiz questions.',
        maxScore: 10,
        dueDate: daysFromNow(4),
        classroomId: classroom._id
      },
      {
        title: 'Assignment 2',
        type: 'ASSIGNMENT',
        instructions: 'Submit your work before the deadline.',
        maxScore: 20,
        dueDate: daysFromNow(6),
        classroomId: classroom._id
      },
      {
        title: 'Old Quiz',
        type: 'QUIZ',
        instructions: 'Late submission test.',
        maxScore: 10,
        dueDate: daysFromNow(-3),
        classroomId: classroom._id
      },
      {
        title: 'Midterm Exam',
        type: 'MIDTERM_EXAM',
        instructions: 'Midterm examination.',
        maxScore: 50,
        dueDate: daysFromNow(10),
        classroomId: classroom._id
      },
      {
        title: 'Assignment 3',
        type: 'ASSIGNMENT',
        instructions: 'Advanced assignment.',
        maxScore: 25,
        dueDate: daysFromNow(14),
        classroomId: classroom._id
      },
      {
        title: 'Final Exam',
        type: 'FINAL_EXAM',
        instructions: 'Final examination.',
        maxScore: 100,
        dueDate: daysFromNow(20),
        classroomId: classroom._id
      }
    ]);


      /* ----- SUBMISSIONS (3 per student) ----- */
      for (const student of students) {

        // ✅ submitted + graded
        await Submission.create({
          studentId: student._id,
          assessmentId: assessments[0]._id,
          submittedAt: new Date(),
          gradedAt: new Date(),
          writtenAnswer: 'Answer A',
          score: 17
        });

        // ✅ submitted + graded
        await Submission.create({
          studentId: student._id,
          assessmentId: assessments[1]._id,
          submittedAt: new Date(),
          gradedAt: new Date(),
          writtenAnswer: 'Answer B',
          score: 8
        });

        // ⚠️ submitted but NOT graded
        await Submission.create({
          studentId: student._id,
          assessmentId: assessments[2]._id,
          submittedAt: new Date(),
          writtenAnswer: 'Answer C'
        });
      }
    }

    console.log('🎉 FULL DATABASE SEEDED');
    console.log('🔑 Login password for ALL users: password123');

  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
};

/* ---------- UTIL ---------- */
function daysFromNow(days) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

seedDatabase();
