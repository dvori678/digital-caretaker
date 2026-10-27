// יוצר משתמשים ובקשות לדוגמה. להרצה: npm run seed
// שימי לב: הסקריפט מוחק את כל המשתמשים והבקשות הקיימים.
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection;
  const users = db.collection('users');
  const tasks = db.collection('tasks');

  await users.deleteMany({});
  await tasks.deleteMany({});

  const hash = await bcrypt.hash('123456', 10);
  const { insertedIds } = await users.insertMany([
    { name: 'משה אב הבית', email: 'caretaker@school.com', password: hash, role: 'caretaker' },
    { name: 'רחל המורה', email: 'rachel@school.com', password: hash, role: 'staff' },
    { name: 'דוד המזכיר', email: 'david@school.com', password: hash, role: 'staff' },
  ]);

  const now = new Date();
  const days = (n) => new Date(now.getTime() + n * 24 * 60 * 60 * 1000);
  const base = { caretakerNote: '', createdAt: now, updatedAt: now, __v: 0 };

  await tasks.insertMany([
    { ...base, title: 'להחליף נורה שרופה', location: "כיתה ד'", category: 'electricity',
      description: 'הנורה מעל הלוח לא דולקת, קשה לתלמידים לראות',
      priority: 'medium', status: 'new', dueDate: days(3), createdBy: insertedIds[1] },
    { ...base, title: 'ברז מטפטף בשירותים', location: 'שירותי בנות קומה 1', category: 'plumbing',
      description: 'הברז השמאלי לא נסגר עד הסוף ומטפטף כל הזמן',
      priority: 'urgent', status: 'in_progress', dueDate: days(1), createdBy: insertedIds[1] },
    { ...base, title: 'להכין את האולם לטקס', location: 'אולם מרכזי', category: 'event-setup',
      description: 'לסדר 200 כיסאות בשורות, במה ומיקרופון לטקס סוף השנה',
      priority: 'urgent', status: 'new', dueDate: days(5), createdBy: insertedIds[2] },
    { ...base, title: 'כיסא שבור', location: 'חדר מורים', category: 'furniture',
      description: 'רגל של כיסא ליד החלון התרופפה, מסוכן לשבת עליו',
      priority: 'low', status: 'done', createdBy: insertedIds[2] },
  ]);

  console.log('Seed done. Password for all users: 123456');
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
