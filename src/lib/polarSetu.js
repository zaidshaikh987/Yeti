// PolarSetu shared constants and helpers

export const ACCESS_CLASSES = {
  open: { label: "OPEN", color: "bg-emerald-50 text-emerald-700 border-emerald-200", description: "Preview + download available" },
  registered: { label: "REGISTERED", color: "bg-blue-50 text-blue-700 border-blue-200", description: "Metadata visible — access request required" },
  restricted: { label: "RESTRICTED", color: "bg-amber-50 text-amber-700 border-amber-200", description: "Metadata visible — file hidden" },
  embargoed: { label: "EMBARGOED", color: "bg-orange-50 text-orange-700 border-orange-200", description: "Metadata visible — embargo end date shown" },
  internal: { label: "INTERNAL", color: "bg-slate-100 text-slate-700 border-slate-300", description: "Staff only" },
  removed: { label: "REMOVED", color: "bg-red-50 text-red-700 border-red-200", description: "Record kept — content removed" },
};

export const REVIEW_STATES = {
  draft: { label: "DRAFT", color: "bg-slate-100 text-slate-600 border-slate-200" },
  ai_generated: { label: "AI GENERATED", color: "bg-purple-50 text-purple-700 border-purple-200" },
  editor_review: { label: "EDITOR REVIEW", color: "bg-blue-50 text-blue-700 border-blue-200" },
  scientific_review: { label: "SCIENTIFIC REVIEW", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  approved: { label: "APPROVED", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  scheduled: { label: "SCHEDULED", color: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  published: { label: "PUBLISHED", color: "bg-teal-50 text-teal-700 border-teal-200" },
  archived: { label: "ARCHIVED", color: "bg-gray-100 text-gray-500 border-gray-200" },
};

export const CONTENT_TYPES = {
  expedition: { label: "Expedition", icon: "Compass" },
  report: { label: "Report", icon: "FileText" },
  dataset: { label: "Dataset", icon: "Database" },
  publication: { label: "Publication", icon: "BookOpen" },
  photograph: { label: "Photograph", icon: "Image" },
  video: { label: "Video", icon: "Video" },
  news: { label: "News", icon: "Newspaper" },
  institutional_activity: { label: "Institutional Activity", icon: "Building2" },
  research_project: { label: "Research Project", icon: "Microscope" },
};

export const REGIONS = {
  antarctica: "Antarctica",
  arctic: "Arctic",
  himalaya: "Himalaya",
  southern_ocean: "Southern Ocean",
  global: "Global",
};

export const ROLES = {
  user: { label: "Citizen / Public", color: "bg-slate-100 text-slate-700" },
  admin: { label: "Administrator", color: "bg-navy text-white" },
  super_admin: { label: "Super Administrator", color: "bg-deep-blue text-white" },
  repository_admin: { label: "Repository Administrator", color: "bg-blue-100 text-blue-800" },
  communication_editor: { label: "Communication Editor", color: "bg-amber-100 text-amber-800" },
  scientific_reviewer: { label: "Scientific Reviewer", color: "bg-indigo-100 text-indigo-800" },
  teacher_coordinator: { label: "Teacher / Outreach Coordinator", color: "bg-cyan-100 text-cyan-800" },
  read_only_auditor: { label: "Read-only Auditor", color: "bg-gray-100 text-gray-700" },
};

export const INGESTION_STAGES = [
  { key: "upload", label: "Upload", icon: "Upload" },
  { key: "virus_scan", label: "Virus Scan", icon: "ShieldCheck" },
  { key: "validation", label: "File Validation", icon: "FileCheck" },
  { key: "checksum", label: "SHA-256 Checksum", icon: "Hash" },
  { key: "extraction", label: "Text Extraction / OCR", icon: "ScanText" },
  { key: "metadata", label: "Metadata Extraction", icon: "Tags" },
  { key: "entity_recognition", label: "Entity Recognition", icon: "BrainCircuit" },
  { key: "thumbnail", label: "Thumbnail", icon: "Image" },
  { key: "embedding", label: "Embedding", icon: "Boxes" },
  { key: "duplicate", label: "Duplicate Detection", icon: "Copy" },
  { key: "human_review", label: "Human Correction", icon: "UserCheck" },
  { key: "review", label: "Review", icon: "ClipboardCheck" },
  { key: "repository", label: "Repository", icon: "Archive" },
];

export const PUBLISHING_STATES = [
  "draft", "ai_generated", "editor_review", "scientific_review", "approved", "scheduled", "published", "archived"
];

export function canPublish(status) {
  return status === "approved" || status === "scheduled" || status === "published";
}

export function formatDate(dateStr) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}