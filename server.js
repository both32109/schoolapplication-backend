require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const multer = require('multer');
const path = require('path');

const fs = require('fs');

const uploadDir = 'uploads/materials';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/materials');
  },
  filename: (req, file, cb) => {
    const unique =
      Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({ storage });



const app = express();

app.set('trust proxy', 1);

const PORT = process.env.PORT || 3000;


const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('!!!!MONGO_URI is not defined');
  process.exit(1);
}

app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
  res.send('School Application Backend is running');
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});


/* =======================
   SCHEMAS
======================= */

const teacherSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String, 
  profilePicture: String
});


const classroomSchema = new mongoose.Schema({
  name: String,
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  colorIdentifier: Number
});

const studentSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String, 
  profilePicture: String,
  classesEnrolled: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Classroom' }]
});



const materialSchema = new mongoose.Schema({
  title: String,
  fileUrl: String,
  fileType: String,
  uploaderName: String,
  uploadDate: { type: Date, default: Date.now },
  classroomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom' }
});

const assessmentSchema = new mongoose.Schema(
  {
    title: String,
    type: String,
    instructions: String,
    dueDate: Date,
    maxScore: Number,
    classroomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom' }
  },
  { timestamps: true } 
);


const submissionSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true },
    submittedAt: { type: Date, default: Date.now },
    gradedAt: Date, 
    writtenAnswer: String,
    comment: String,
    score: Number,
    fileAttachments: [String]
  },
  { timestamps: true }
);


submissionSchema.index({ studentId: 1, assessmentId: 1 }, { unique: true });

/* =======================
   MODELS
======================= */

const Teacher = mongoose.model('Teacher', teacherSchema, 'teachers');
const Student = mongoose.model('Student', studentSchema, 'students');
const Classroom = mongoose.model('Classroom', classroomSchema, 'classrooms');
const Material = mongoose.model('Material', materialSchema, 'materials');
const Assessment = mongoose.model('Assessment', assessmentSchema, 'assessments');
const Submission = mongoose.model('Submission', submissionSchema, 'submissions');

function requireTeacher(req, res, next) { //teacher check
  if (req.body.uploaderName !== 'Teacher') {
    return res.status(403).json({ message: 'Only teachers can perform this action' });
  }
  next();
}


/* =======================
   ROUTES
======================= */

app.patch('/users/:role/:userId', async (req, res) => {
  const { role, userId } = req.params;
  const { name, email, newPassword } = req.body;

  const Model = role === 'TEACHER' ? Teacher : Student;

  const update = { name, email };

  if (newPassword) {
    update.password = await bcrypt.hash(newPassword, 10);
  }

  const user = await Model.findByIdAndUpdate(
    userId,
    update,
    { new: true }
  );

  res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    profilePicture: user.profilePicture
  });
});

app.put('/students/:id', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const update = {};
    if (name) update.name = name;
    if (email) update.email = email;

    if (password) {
      update.password = await bcrypt.hash(password, 10);
    }

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    );

    res.json({
      id: student._id,
      name: student.name,
      email: student.email,
      profilePicture: student.profilePicture
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/teachers/:id', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const update = {};
    if (name) update.name = name;
    if (email) update.email = email;

    if (password) {
      update.password = await bcrypt.hash(password, 10);
    }

    const teacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    );

    res.json({
      id: teacher._id,
      name: teacher.name,
      email: teacher.email,
      profilePicture: teacher.profilePicture
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/users/:id/profile-picture',
  upload.single('file'),
  async (req, res) => {
    const fileUrl =
      `https://${req.get('host')}/uploads/materials/${req.file.filename}`;


    const { id } = req.params;
    const { role } = req.body;

    const Model = role === 'STUDENT' ? Student : Teacher;

    await Model.findByIdAndUpdate(id, {
      profilePicture: fileUrl
    });

    res.json({ profilePicture: fileUrl });
});

app.post('/users/:role/:userId/profile-picture',
  upload.single('file'),
  async (req, res) => {

    const Model = req.params.role === 'TEACHER' ? Teacher : Student;

    const fileUrl = `https://${req.get('host')}/uploads/materials/${req.file.filename}`;

    const user = await Model.findByIdAndUpdate(
      req.params.userId,
      { profilePicture: fileUrl },
      { new: true }
    );

    res.json({ profilePicture: fileUrl });
});


/* ---------- STUDENT ---------- */
app.get('/students/:studentId', async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId)
      .populate({
        path: 'classesEnrolled',
        populate: { path: 'teacher' }
      });

    if (!student) return res.status(404).send('Student not found');
    res.json(student);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ---------- TEACHER CLASSES ---------- */
app.get('/teachers/:teacherId/classes', async (req, res) => {
  try {
    const classes = await Classroom.find({
      teacher: req.params.teacherId
    }).populate('teacher');

    res.json(classes);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ---------- CLASSROOM (FULL DETAILS) ---------- */
app.get('/classrooms/:classroomId', async (req, res) => {
  try {
    const { classroomId } = req.params;
    const { studentId } = req.query;

    const classroom = await Classroom.findById(classroomId).populate('teacher');
    if (!classroom) return res.status(404).send('Classroom not found');

    const materials = await Material.find({ classroomId });
    const assessments = await Assessment.find({ classroomId });

  if (!studentId) {
    const students = await Student.find({
      classesEnrolled: classroomId
    }).select('_id name email profilePicture');

    const activeStudentIds = students.map(s => s._id);

    const populated = await Promise.all(
      assessments.map(async a => {
        const submissions = await Submission.find({
          assessmentId: a._id,
          studentId: { $in: activeStudentIds }
        }).populate('studentId', 'name');

        return {
          ...a.toObject(),
          submissions: submissions.map(s => ({
            _id: s._id,
            studentId: s.studentId._id.toString(),
            studentName: s.studentId.name,
            assessmentId: s.assessmentId,
            submittedAt: s.submittedAt,
            gradedAt: s.gradedAt,
            writtenAnswer: s.writtenAnswer,
            comment: s.comment,
            score: s.score,
            fileAttachments: s.fileAttachments
          })),
          submissionCount: submissions.length,
          totalStudents: activeStudentIds.length
        };
      })
    );
    
    return res.json({
      ...classroom.toObject(),
      materials,
      assessments: populated,
      students 
    });
  }


    const populated = await Promise.all(
      assessments.map(async a => {
        const submission = await Submission.findOne({
          assessmentId: a._id,
          studentId
        });

        return {
          ...a.toObject(),
          studentSubmission: submission
        };
      })
    );

    res.json({
      ...classroom.toObject(),
      materials,
      assessments: populated
    });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ---------- TEACHER: CREATE CLASS ---------- */
app.post('/teachers/:teacherId/classes', async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { name, colorIdentifier } = req.body;

    if (!name || colorIdentifier === undefined) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    // ensure teacher exists
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const classroom = new Classroom({
      name,
      teacher: teacherId,
      colorIdentifier
    });

    await classroom.save();

    const populated = await classroom.populate('teacher');

    res.status(201).json(populated);
  } catch (e) {
    console.error('CREATE_CLASS_ERROR', e);
    res.status(500).json({ error: e.message });
  }
});


app.delete('/classrooms/:classroomId', async (req, res) => {
  try {
    const { classroomId } = req.params;

    const assessments = await Assessment.find({ classroomId });
    const assessmentIds = assessments.map(a => a._id);

    await Submission.deleteMany({
      assessmentId: { $in: assessmentIds }
    });

    await Assessment.deleteMany({ classroomId });

    await Material.deleteMany({ classroomId });

    await Student.updateMany(
      { classesEnrolled: classroomId },
      { $pull: { classesEnrolled: classroomId } }
    );

    await Classroom.findByIdAndDelete(classroomId);

    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


/* ---------- TEACHER: ADD STUDENT TO CLASSROOM ---------- */
app.post('/classrooms/:classroomId/students', async (req, res) => {
  try {
    const { classroomId } = req.params;
    const { email } = req.body;

    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (student.classesEnrolled.some(id => id.toString() === classroomId)) {
      return res.status(409).json({ message: 'Student already enrolled' });
    }

    student.classesEnrolled.push(classroomId);
    await student.save();

    res.status(200).json({ message: 'Student added to classroom' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});



    /* ---------- TEACHER: REMOVE STUDENT FROM CLASSROOM ---------- */
app.delete('/classrooms/:classroomId/students/:studentId', async (req, res) => {
  try {
    const { classroomId, studentId } = req.params;

    await Student.findByIdAndUpdate(
      studentId,
      { $pull: { classesEnrolled: classroomId } }
    );

    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ---------- MATERIALS ---------- */
app.get('/classrooms/:classroomId/materials', async (req, res) => {
  try {
    const materials = await Material.find({ classroomId: req.params.classroomId });
    res.json(materials);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/classrooms/:classroomId/materials', requireTeacher, async (req, res) => {
  try {
    const material = new Material({
      title: req.body.title,
      fileUrl: req.body.fileUrl,
      fileType: req.body.fileType,
      uploaderName: req.body.uploaderName,
      classroomId: req.params.classroomId
    });

    await material.save();
    res.status(201).json(material);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post(
  '/classrooms/:classroomId/materials/upload',
  upload.single('file'), 
  async (req, res) => {
    try {
      // teacher check
      if (req.body.uploaderName !== 'Teacher') {
        return res.status(403).json({ message: 'Only teachers can upload materials' });
      }

      const fileUrl =
        `https://${req.get('host')}/uploads/materials/${req.file.filename}`;

      const material = new Material({
        title: req.body.title,
        fileUrl,
        fileType: req.body.fileType,
        uploaderName: req.body.uploaderName,
        classroomId: req.params.classroomId
      });

      await material.save();
      res.status(201).json(material);

    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
);

app.delete('/classrooms/:classroomId/materials/:materialId', async (req, res) => {
  try {
    await Material.findByIdAndDelete(req.params.materialId);
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ---------- ASSESSMENTS ---------- */
/* ---------- TEACHER: GET SINGLE SUBMISSION ---------- */
app.get('/classrooms/:classroomId/assessments/:assessmentId/submissions/:submissionId',
  async (req, res) => {
    try {
      const { classroomId, assessmentId, submissionId } = req.params;

      const assessment = await Assessment.findOne({
        _id: assessmentId,
        classroomId
      });

      if (!assessment) {
        return res.status(404).json({ message: 'Assessment not found' });
      }

      const submission = await Submission.findById(submissionId);
      if (!submission) {
        return res.status(404).json({ message: 'Submission not found' });
      }

      res.json({
        assessment,
        submission
      });

    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
);


app.get('/classrooms/:classroomId/assessments', async (req, res) => {
  try {
    const { classroomId } = req.params;
    const { studentId, role } = req.query;

    const assessments = await Assessment.find({ classroomId });

    // TEACHER VIEW
    if (role === 'TEACHER') {
      const students = await Student.find({
        classesEnrolled: classroomId
      }).select('_id');

      const activeStudentIds = students.map(s => s._id);

      const populated = await Promise.all(
        assessments.map(async a => {
          const submissionCount = await Submission.countDocuments({
            assessmentId: a._id,
            studentId: { $in: activeStudentIds }
          });

          return {
            ...a.toObject(),
            submissionCount,
            totalStudents: activeStudentIds.length
          };
        })
      );
      return res.json(populated);
    }

    // STUDENT VIEW
    const populated = await Promise.all(
      assessments.map(async a => {
        const submission = await Submission.findOne({
          assessmentId: a._id,
          studentId
        });

        return {
          ...a.toObject(),
          studentSubmission: submission
        };
      })
    );

    res.json(populated);

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ---------- CREATE ASSESSMENT (TEACHER ONLY) ---------- */
app.post('/classrooms/:classroomId/assessments', async (req, res) => {
  try {
    const {
      title,
      type,
      instructions,
      dueDate,
      maxScore
    } = req.body;

    if (!title || !type || !instructions || !dueDate || !maxScore) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const assessment = new Assessment({
      title,
      type,
      instructions,
      dueDate,
      maxScore,
      classroomId: req.params.classroomId
    });

    await assessment.save();
    res.status(201).json(assessment);

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/classrooms/:classroomId/assessments/:assessmentId', async (req, res) => {
  const assessment = await Assessment.findOne({
    _id: req.params.assessmentId,
    classroomId: req.params.classroomId
  });

  if (!assessment) return res.status(404).json({ message: 'Not found' });
  res.json(assessment);
});


app.put('/classrooms/:classroomId/assessments/:assessmentId', async (req, res) => {
  try {
    const { title, instructions, dueDate, maxScore } = req.body;

    const updated = await Assessment.findOneAndUpdate(
      { _id: req.params.assessmentId, classroomId: req.params.classroomId },
      { title, instructions, dueDate, maxScore },
      { new: true }
    );

    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/classrooms/:classroomId/assessments/:assessmentId', async (req, res) => {
  try {
    const { classroomId, assessmentId } = req.params;

    await Submission.deleteMany({ assessmentId });
    await Assessment.findOneAndDelete({
      _id: assessmentId,
      classroomId
    });

    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


/* ---------- SUBMISSION ---------- */
app.post('/assessments/:assessmentId/submit', async (req, res) => {
  try {
    const assessmentId = new mongoose.Types.ObjectId(req.params.assessmentId);
    const studentId = new mongoose.Types.ObjectId(req.body.studentId);

    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) return res.status(404).json({ error: 'Assessment not found' });

    if (new Date() > assessment.dueDate) {
      return res.status(403).json({ message: 'Deadline has passed' });
    }

    const existing = await Submission.findOne({ assessmentId, studentId });
    if (existing) {
      return res.status(409).json({ message: 'Submission already exists' });
    }

    const submission = new Submission({
      assessmentId,
      studentId,
      writtenAnswer: req.body.writtenAnswer,
      comment: req.body.comment,
      fileAttachments: req.body.fileAttachments || []
    });

    await submission.save();
    res.status(201).json({ message: 'Submission successful' });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


app.post('/submissions/:submissionId/grade', async (req, res) => {
  try {
    const { score, comment } = req.body;

    const submission = await Submission.findById(req.params.submissionId)
      .populate({
        path: 'assessmentId',
        populate: { path: 'classroomId' }
      });

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    submission.score = score;
    submission.comment = comment;
    submission.gradedAt = new Date();
    await submission.save();

    res.json(submission);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});




/* ---------- SIGN UP ---------- */
app.post('/auth/signup', async (req, res) => {
  const { role, name, email, password } = req.body;

  if (!role || !name || !email || !password) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    if (role === 'STUDENT') {
      const student = new Student({ name, email, password: hashedPassword });
      await student.save();
      return res.status(201).json({ message: 'Student created' });
    }

    if (role === 'TEACHER') {
      const teacher = new Teacher({ name, email, password: hashedPassword });
      await teacher.save();
      return res.status(201).json({ message: 'Teacher created' });
    }

    res.status(400).json({ message: 'Invalid role' });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});



/* ---------- LOGIN ---------- */
app.post('/auth/login', async (req, res) => {
  const { role, email, password } = req.body;

  if (!role || !email || !password) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  let user;
  if (role === 'STUDENT') {
    user = await Student.findOne({ email });
  } else if (role === 'TEACHER') {
    user = await Teacher.findOne({ email });
  } else {
    return res.status(400).json({ message: 'Invalid role' });
  }

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  res.json({
    id: user._id.toString(),
    role,
    name: user.name,
    email: user.email,
    profilePicture: user.profilePicture || null
  });
});





/* =======================
   START SERVER
======================= */

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection failed', err);
    process.exit(1);
  });
