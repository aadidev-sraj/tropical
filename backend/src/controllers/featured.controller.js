const Featured = require('../models/featured.model');

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN;

// Polyfill fetch for Node versions without global fetch
let fetchLib = (typeof fetch !== 'undefined') ? fetch : null;
if (!fetchLib) {
  try {
    fetchLib = require('node-fetch');
  } catch (_) {
    fetchLib = null;
  }
}

async function fetchFromStrapi(path) {
  const url = `${STRAPI_URL}${path}`;
  const headers = { 'Content-Type': 'application/json' };
  if (STRAPI_TOKEN) headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;
  if (!fetchLib) throw new Error('fetch is not available and node-fetch is not installed');

  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const to = controller ? setTimeout(() => controller.abort(), 10000) : null;
  try {
    const res = await fetchLib(url, { headers, signal: controller ? controller.signal : undefined });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Strapi request failed (${url}): ${res.status} ${text}`);
    }
    return res.json();
  } catch (e) {
    const msg = (e && e.message) ? e.message : String(e);
    throw new Error(`Strapi fetch failed (${url}): ${msg}`);
  } finally {
    if (to) clearTimeout(to);
  }
}

function mapStrapiFeatured(sf) {
  // Support both flat and nested formats
  const a = sf?.attributes || sf || {};
  
  // Images: handle multiple images in array
  let urls = [];
  const imgField = a?.images || a?.image || a?.media;
  
  // Flat array of image objects with url directly
  if (Array.isArray(imgField) && imgField.length > 0 && imgField[0]?.url) {
    urls = imgField.map((img) => img?.url).filter(Boolean);
  } 
  // Nested: imgField.data is array
  else if (Array.isArray(imgField?.data)) {
    urls = imgField.data.map((d) => d?.attributes?.url || d?.url).filter(Boolean);
  } 
  // Nested: imgField.data is single object
  else if (imgField?.data?.attributes?.url || imgField?.data?.url) {
    urls = [imgField.data.attributes?.url || imgField.data.url];
  } 
  // Direct url (single)
  else if (typeof imgField?.url === 'string') {
    urls = [imgField.url];
  }
  
  if (urls.length === 0) return null;
  
  const fullUrls = urls.map((u) => (String(u).startsWith('http') ? u : `${STRAPI_URL}${u}`));
  
  return {
    strapiId: sf?.id,
    images: fullUrls,
    primaryImage: fullUrls[0] || null,
    active: typeof a?.active === 'boolean' ? a.active : true,
  };
}

// Sync featured items from Strapi
async function syncAllFromStrapi() {
  const json = await fetchFromStrapi('/api/featureds?populate=*');
  const items = Array.isArray(json?.data) ? json.data : [];
  const mapped = items.map(mapStrapiFeatured).filter(Boolean);
  const ops = mapped.map((m) => {
    const filter = (m.strapiId !== undefined && m.strapiId !== null)
      ? { strapiId: m.strapiId }
      : (m.primaryImage ? { primaryImage: m.primaryImage } : { images: m.images });
    return Featured.findOneAndUpdate(
      filter,
      { $set: m },
      { upsert: true, new: true }
    );
  });
  const saved = await Promise.all(ops);

  // Remove stale featured entries that disappeared from Strapi
  const currentIds = mapped
    .map((m) => m.strapiId)
    .filter((id) => id !== undefined && id !== null);
  if (currentIds.length > 0) {
    await Featured.deleteMany({
      strapiId: { $exists: true, $nin: currentIds },
    });
  }

  // Backfill primaryImage for existing docs if missing (best-effort)
  try {
    await Featured.updateMany(
      { $or: [ { primaryImage: { $exists: false } }, { primaryImage: null } ] },
      [ { $set: { primaryImage: { $arrayElemAt: [ "$images", 0 ] } } } ]
    );
  } catch (_) {}

  // Deduplicate by primaryImage: keep newest
  try {
    const dupes = await Featured.aggregate([
      { $match: { primaryImage: { $ne: null } } },
      { $group: { _id: "$primaryImage", ids: { $push: "$_id" }, count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]);
    for (const d of dupes) {
      const ids = d.ids || [];
      if (ids.length > 1) {
        // Sort by ObjectId time, keep latest
        const sorted = ids.sort((a,b) => a.getTimestamp?.() - b.getTimestamp?.());
        const toDelete = sorted.slice(0, sorted.length - 1);
        if (toDelete.length) {
          await Featured.deleteMany({ _id: { $in: toDelete } });
        }
      }
    }
  } catch (_) {}

  return saved.length;
}

// POST /api/featured/sync
exports.syncFromStrapi = async (req, res, next) => {
  try {
    const count = await syncAllFromStrapi();
    res.json({ count });
  } catch (err) {
    next(err);
  }
};

// GET /api/featured
exports.list = async (req, res, next) => {
  try {
    const featured = await Featured.find({ active: true }).sort({ order: 1, createdAt: -1 }).lean();
    res.json({ data: featured });
  } catch (err) {
    next(err);
  }
};

// Webhook handler
exports.strapiWebhook = async (req, res, next) => {
  try {
    const body = req.body || {};
    const entry = body.entry || body.data || body;
    if (!entry) return res.status(400).json({ message: 'No entry in payload' });

    // Handle delete events from Strapi if provided
    const event = body.event || body.type || body.action;
    const strapiId = entry.id || entry._id;
    if (String(event).toLowerCase().includes('delete') && strapiId != null) {
      await Featured.deleteOne({ strapiId });
      return res.json({ ok: true, deleted: true });
    }

    const mapped = mapStrapiFeatured({ id: strapiId, ...entry });
    if (!mapped) return res.status(400).json({ message: 'Missing images' });
    const filter = (mapped.strapiId !== undefined && mapped.strapiId !== null)
      ? { strapiId: mapped.strapiId }
      : (mapped.primaryImage ? { primaryImage: mapped.primaryImage } : { images: mapped.images });
    const saved = await Featured.findOneAndUpdate(
      filter,
      { $set: mapped },
      { upsert: true, new: true }
    );
    return res.json({ ok: true, id: saved._id });
  } catch (err) {
    next(err);
  }
};

exports.syncAllFromStrapi = syncAllFromStrapi;
