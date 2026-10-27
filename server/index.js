require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

/* ---------- מודלים (מבנה הנתונים במסד) ---------- */

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true }, // נשמרת מוצפנת בלבד
  role: { type: String, enum: ['staff', 'caretaker'], default: 'staff' },
});
const User = mongoose.model('User', userSchema);

const CATEGORIES = ['electricity', 'plumbing', 'furniture', 'cleaning', 'event-setup', 'other'];
const PRIORITIES = ['low', 'medium', 'urgent'];
const STATUSES = ['new', 'in_progress', 'done'];

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    location: { type: String, required: true, trim: true },
    category: { type: String, enum: CATEGORIES, default: 'other' },
    priority: { type: String, enum: PRIORITIES, default: 'medium' },
    status: { type: String, enum: STATUSES, default: 'new' },
    dueDate: { type: Date },
    caretakerNote: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true } // יוצר createdAt ו-updatedAt אוטומטית
);
const Task = mongoose.model('Task', taskSchema);

/* ---------- התחברות והרשאות ---------- */

// בדיקת טוקן: קורא את הכותרת Authorization: Bearer <token>
function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'לא מחובר' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET); // { id, role }
    next();
  } catch {
    res.status(401).json({ message: 'הטוקן אינו תקף, יש להתחבר מחדש' });
  }
}

app.post('/api/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'יש להזין מייל וסיסמה' });

    const user = await User.findOne({ email: email.toLowerCase() });
    const ok = user && (await bcrypt.compare(password, user.password));
    if (!ok) return res.status(401).json({ message: 'מייל או סיסמה שגויים' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '8h',
    });
    res.json({ token, user: { id: user._id, name: user.name, role: user.role } });
  } catch (err) {
    next(err);
  }
});

/* ---------- בקשות (Tasks) ---------- */

const PRIORITY_RANK = { urgent: 0, medium: 1, low: 2 };

// רשימת בקשות: אב בית רואה הכול, איש צוות רק את שלו
app.get('/api/tasks', auth, async (req, res, next) => {
  try {
    const { search, status, category, priority, sort } = req.query;
    const filter = {};

    if (req.user.role !== 'caretaker') filter.createdBy = req.user.id;
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (search) {
      const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ title: rx }, { description: rx }, { location: rx }];
    }

    let tasks = await Task.find(filter).populate('createdBy', 'name').lean();

    if (sort === 'priority') {
      tasks.sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
    } else if (sort === 'dueDate') {
      // בקשות בלי תאריך יעד בסוף
      tasks.sort((a, b) => (a.dueDate || Infinity) - (b.dueDate || Infinity));
    } else {
      tasks.sort((a, b) => b.createdAt - a.createdAt); // ברירת מחדל: החדשות קודם
    }
    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

// פונקציית עזר: טוענת בקשה ובודקת שלמשתמש מותר לגשת אליה
async function loadTask(req, res) {
  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404).json({ message: 'הבקשה לא נמצאה' });
    return null;
  }
  const isOwner = String(task.createdBy) === req.user.id;
  if (req.user.role !== 'caretaker' && !isOwner) {
    res.status(403).json({ message: 'אין הרשאה לבקשה זו' });
    return null;
  }
  return task;
}

app.get('/api/tasks/:id', auth, async (req, res, next) => {
  try {
    const task = await loadTask(req, res);
    if (task) {
      await task.populate('createdBy', 'name');
      res.json(task);
    }
  } catch (err) {
    next(err);
  }
});

// פתיחת בקשה חדשה (איש צוות; גם אב בית יכול)
app.post('/api/tasks', auth, async (req, res, next) => {
  try {
    const { title, description, location, category, priority, dueDate } = req.body;
    const task = await Task.create({
      title,
      description,
      location,
      category,
      priority,
      dueDate: dueDate || undefined,
      createdBy: req.user.id, // נלקח מהטוקן, לא מהקליינט
    });
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
});

app.put('/api/tasks/:id', auth, async (req, res, next) => {
  try {
    const task = await loadTask(req, res); // בודק שהבקשה קיימת ושלמשתמש מותר לגשת אליה
    if (!task) return;

    const isCaretaker = req.user.role === 'caretaker';

    // איש צוות עורך רק כל עוד הבקשה חדשה. אב הבית תמיד
    if (!isCaretaker && task.status !== 'new') {
      return res.status(403).json({ message: 'אי אפשר לערוך בקשה שכבר בטיפול' });
    }

    // שדות שכולם יכולים לערוך
    const { title, description, location, category, priority, dueDate, status, caretakerNote } = req.body;
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (location !== undefined) task.location = location;
    if (category !== undefined) task.category = category;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate || undefined; // מחרוזת ריקה = מחיקת התאריך

    // סטטוס והערה: רק אב הבית
    if (isCaretaker) {
      if (status !== undefined) task.status = status;
      if (caretakerNote !== undefined) task.caretakerNote = caretakerNote;
    }

    await task.save(); // מריץ את בדיקות התקינות של הסכמה
    await task.populate('createdBy', 'name');
    res.json(task);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/tasks/:id', auth, async (req, res, next) => {
  try {
    const task = await loadTask(req, res);
    if (!task) return;
    if (req.user.role !== 'caretaker' && task.status !== 'new') {
      return res.status(403).json({ message: 'אי אפשר למחוק בקשה שכבר בטיפול' });
    }
    await task.deleteOne();
    res.json({ message: 'הבקשה נמחקה' });
  } catch (err) {
    next(err);
  }
});

/* ---------- טיפול בשגיאות והפעלה ---------- */

app.use((err, req, res, next) => {
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    return res.status(400).json({ message: 'נתונים לא תקינים', details: err.message });
  }
  console.error(err);
  res.status(500).json({ message: 'שגיאת שרת' });
});

const PORT = process.env.PORT || 4000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
  .catch((err) => {
    console.error('DB connection failed:', err.message);
    process.exit(1);
  });
