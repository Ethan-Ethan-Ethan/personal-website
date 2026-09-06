import { createHash } from 'node:crypto';

export const SITE_SECTIONS = ['projects', 'ai-lab', 'trading-lab', 'about'];
export const PUBLIC_STATUSES = ['active', 'completed', 'research', 'paused'];

const DENIED_PATH_PATTERNS = [
  /(^|\/)\.trash(\/|$)/i,
  /(^|\/)(?:\.archive|_?archive|封存)(\/|$)/i,
  /(^|\/)(?:graphify-out|logs?|credentials?)(\/|$)/i,
  /(^|\/)履歷\/(?:.*\.(?:pdf|docx?|jpe?g|png)|.*(?:護照|戶籍|兵役|證照|證件))/i,
];

const SENSITIVE_PATTERNS = [
  ['keychain-reference', /\bkeychain\b|security\s+find-generic-password/i],
  ['localhost-reference', /\b(?:localhost|127\.0\.0\.1)(?::\d+)?\b/i],
  ['absolute-path', /\/(?:Users|home|private|var)\/[\w .\-/]+/i],
  ['credential-reference', /(?:api[_ -]?key|client[_ -]?secret|access[_ -]?token|bearer\s+[a-z0-9._-]{12,}|github_pat_[a-z0-9_]{20,}|gh[pousr]_[a-z0-9]{20,}|sk-(?:proj-)?[a-z0-9_-]{20,}|(?:AKIA|ASIA)[A-Z0-9]{16})/i],
  ['phone-number', /(?:\+[1-9]\d{0,2}[\s.-]?)?(?:0?9\d{2}[\s.-]?\d{3}[\s.-]?\d{3})|\+[1-9]\d{0,2}(?:[\s.-]?\(?\d{2,4}\)?){2,5}\b|(?:\+?1[\s.-]?)?(?:\(\d{3}\)|\d{3})[\s.-]\d{3}[\s.-]\d{4}/],
];

const STATUS_MAP = {
  active: 'active',
  completed: 'completed',
  verified: 'completed',
  seedling: 'research',
  draft: 'research',
  legacy: 'paused',
  archived: 'paused',
};

function requiredString(data, key) {
  if (typeof data[key] !== 'string' || !data[key].trim()) {
    throw new Error(`${key} is required`);
  }
  return data[key].trim();
}

export function sourceHash(source) {
  return createHash('sha256').update(String(source)).digest('hex');
}

export function scanForSensitiveContent(source) {
  const text = String(source);
  return SENSITIVE_PATTERNS.filter(([, pattern]) => pattern.test(text)).map(([name]) => name);
}

export function validatePublicRecord(data, sourcePath) {
  const normalizedPath = String(sourcePath).replaceAll('\\', '/');
  if (DENIED_PATH_PATTERNS.some((pattern) => pattern.test(normalizedPath))) {
    throw new Error(`denied source path: ${normalizedPath}`);
  }
  if (data.site_publish !== true) throw new Error('site_publish must be true');
  if (data.site_visibility !== 'public') throw new Error('site_visibility must be public');
  const section = requiredString(data, 'site_section');
  if (!SITE_SECTIONS.includes(section)) throw new Error(`unsupported site_section: ${section}`);
  requiredString(data, 'site_slug');
  requiredString(data, 'site_title');
  requiredString(data, 'site_summary');
  requiredString(data, 'site_last_reviewed');
  if (typeof data.status !== 'string' || !Object.hasOwn(STATUS_MAP, data.status)) {
    throw new Error('status must map to a public status');
  }
  if (!Number.isFinite(data.site_order)) throw new Error('site_order must be a finite number');
  for (const field of ['tags', 'site_highlights']) {
    if (data[field] !== undefined && (!Array.isArray(data[field])
        || data[field].some((value) => typeof value !== 'string' || !value.trim()))) {
      throw new Error(`${field} must be an array of non-empty strings`);
    }
  }

  if (section === 'trading-lab') {
    requiredString(data, 'site_evidence_date');
    requiredString(data, 'site_evidence_scope');
    requiredString(data, 'site_disclaimer');
    if (data.site_live_signal !== false) throw new Error('site_live_signal must be false');
  }
  return true;
}

export function buildPublicContent(data, sourcePath) {
  validatePublicRecord(data, sourcePath);
  const id = requiredString(data, 'project');
  const status = STATUS_MAP[data.status];
  const record = {
    id,
    slug: data.site_slug.trim(),
    title: data.site_title.trim(),
    summary: data.site_summary.trim(),
    section: data.site_section,
    status,
    updatedAt: String(data.updated || data.site_last_reviewed),
    lastReviewed: data.site_last_reviewed,
    featured: data.site_featured === true,
    order: data.site_order,
    tags: data.tags ? [...data.tags] : [],
    highlights: data.site_highlights ? [...data.site_highlights] : [],
  };
  if (typeof data.site_cover === 'string' && data.site_cover.trim()) record.cover = data.site_cover.trim();
  if (typeof data.site_demo_url === 'string' && data.site_demo_url.trim()) record.demoUrl = data.site_demo_url.trim();
  if (typeof data.site_repo_url === 'string' && data.site_repo_url.trim()) record.repoUrl = data.site_repo_url.trim();
  if (data.site_section === 'trading-lab') {
    record.evidence = {
      date: data.site_evidence_date,
      scope: data.site_evidence_scope,
      disclaimer: data.site_disclaimer,
      liveSignal: false,
    };
  }
  return record;
}
