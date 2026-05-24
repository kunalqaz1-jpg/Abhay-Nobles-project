import {
  AdminUser,
  Admission,
  Announcement,
  AttendanceRecord,
  Contact,
  Event,
  GalleryImage,
  Homework,
  Message,
  Notice,
  Result,
  Session,
  Student,
  StudyMaterial,
  Teacher,
  TimetableRow,
  connectDB,
  mongoose,
} from "@workspace/db";

function hasFlag(flag: string) {
  return process.argv.includes(flag);
}

function readArg(flag: string) {
  const index = process.argv.indexOf(flag);
  return index === -1 ? "" : (process.argv[index + 1] ?? "");
}

async function countDocuments() {
  const [
    students,
    teachers,
    admins,
    sessions,
    attendance,
    homework,
    results,
    notices,
    messages,
    materials,
    timetable,
    events,
    admissions,
    contacts,
    announcements,
    galleryImages,
  ] = await Promise.all([
    Student.countDocuments(),
    Teacher.countDocuments(),
    AdminUser.countDocuments(),
    Session.countDocuments(),
    AttendanceRecord.countDocuments(),
    Homework.countDocuments(),
    Result.countDocuments(),
    Notice.countDocuments(),
    Message.countDocuments(),
    StudyMaterial.countDocuments(),
    TimetableRow.countDocuments(),
    Event.countDocuments(),
    Admission.countDocuments(),
    Contact.countDocuments(),
    Announcement.countDocuments(),
    GalleryImage.countDocuments(),
  ]);

  return {
    students,
    teachers,
    admins,
    sessions,
    attendance,
    homework,
    results,
    notices,
    messages,
    materials,
    timetable,
    events,
    admissions,
    contacts,
    announcements,
    galleryImages,
  };
}

async function main() {
  const includeEnquiries = hasFlag("--include-enquiries");
  const includeWebsiteContent = hasFlag("--include-website-content");
  const confirm = readArg("--confirm");

  if (confirm !== "RESET") {
    console.error("Usage: pnpm --filter @workspace/scripts run school:reset -- --confirm RESET [--include-enquiries] [--include-website-content]");
    console.error("This clears ERP portal records so you can start with a fresh admin/teacher/student setup.");
    process.exitCode = 1;
    return;
  }

  await connectDB();

  const before = await countDocuments();

  await Promise.all([
    Student.deleteMany({}),
    Teacher.deleteMany({}),
    AdminUser.deleteMany({}),
    Session.deleteMany({}),
    AttendanceRecord.deleteMany({}),
    Homework.deleteMany({}),
    Result.deleteMany({}),
    Notice.deleteMany({}),
    Message.deleteMany({}),
    StudyMaterial.deleteMany({}),
    TimetableRow.deleteMany({}),
    Event.deleteMany({}),
    ...(includeEnquiries ? [Admission.deleteMany({}), Contact.deleteMany({})] : []),
    ...(includeWebsiteContent ? [Announcement.deleteMany({}), GalleryImage.deleteMany({})] : []),
  ]);

  const after = await countDocuments();

  console.log("ERP reset complete.");
  console.log(JSON.stringify({
    cleared: {
      students: before.students - after.students,
      teachers: before.teachers - after.teachers,
      admins: before.admins - after.admins,
      sessions: before.sessions - after.sessions,
      attendance: before.attendance - after.attendance,
      homework: before.homework - after.homework,
      results: before.results - after.results,
      notices: before.notices - after.notices,
      messages: before.messages - after.messages,
      materials: before.materials - after.materials,
      timetable: before.timetable - after.timetable,
      events: before.events - after.events,
      admissions: before.admissions - after.admissions,
      contacts: before.contacts - after.contacts,
      announcements: before.announcements - after.announcements,
      galleryImages: before.galleryImages - after.galleryImages,
    },
    kept: {
      enquiries: !includeEnquiries,
      websiteContent: !includeWebsiteContent,
    },
  }, null, 2));
}

main()
  .catch((error) => {
    console.error("Failed to reset ERP data.");
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close().catch(() => {});
  });
