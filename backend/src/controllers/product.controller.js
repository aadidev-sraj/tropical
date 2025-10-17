const Product = require('../models/product.model');
const mongoose = require('mongoose');

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN; // optional

// Polyfill fetch for Node versions without global fetch
let fetchLib = (typeof fetch !== 'undefined') ? fetch : null;
if (!fetchLib) {
  try {
    // node-fetch v2 CommonJS
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    fetchLib = require('node-fetch');
  } catch (_) {
    // leave null; calling will throw a clear error below
    fetchLib = null;
  }
}

// POST webhook from Strapi to push entry changes directly
// Expected body shapes (Strapi v4):
// { event: 'entry.publish'|'entry.update', model: 'product', entry: { id, name, slug, price, description, images/image } }
exports.strapiWebhook = async (req, res, next) => {
  try {
    const body = req.body || {};
    const entry = body.entry || body.data || body;
    if (!entry) return res.status(400).json({ message: 'No entry in payload' });

    // Normalize to mapStrapiProduct input shape
    const attributes = { ...entry };
    const sp = { id: entry.id || entry._id, attributes };
    const mapped = mapStrapiProduct(sp);
    if (!mapped.slug) return res.status(400).json({ message: 'Missing slug' });

    // If webhook indicates a delete event, remove the product immediately
    const event = body.event || body.type || body.action;
    if (event && String(event).toLowerCase().includes('delete')) {
      if (mapped.strapiId !== undefined && mapped.strapiId !== null) {
        await Product.deleteOne({ strapiId: mapped.strapiId });
      } else {
        await Product.deleteOne({ slug: mapped.slug });
      }
      return res.json({ ok: true, deleted: true });
    }

    // Use strapiId when present, otherwise fallback to slug to avoid duplicates
    const filter = (mapped.strapiId !== undefined && mapped.strapiId !== null)
      ? { strapiId: mapped.strapiId }
      : { slug: mapped.slug };

    const saved = await Product.findOneAndUpdate(
      filter,
      { $set: mapped },
      { upsert: true, new: true }
    );
    return res.json({ ok: true, id: saved._id });
  } catch (err) {
    next(err);
  }
};

async function fetchFromStrapi(path) {
  const url = `${STRAPI_URL}${path}`;
  const headers = { 'Content-Type': 'application/json' };
  if (STRAPI_TOKEN) headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;
  if (!fetchLib) throw new Error('fetch is not available and node-fetch is not installed');

  // Add a 10s timeout to avoid hanging
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

function slugify(input) {
  return String(input || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function mapStrapiProduct(sp) {
  // Support both flat (v5/flat mode) and nested (v4 default) response formats
  // Flat: { id, name, slug, price, image: [...] }
  // Nested: { id, attributes: { name, slug, price, image: { data: [...] } } }
  const a = sp?.attributes || sp || {};
  
  const keyOf = (obj, candidates) => {
    for (const k of candidates) {
      if (obj && Object.prototype.hasOwnProperty.call(obj, k)) return obj[k];
      const alt = Object.keys(obj || {}).find((kk) => kk.toLowerCase() === k.toLowerCase());
      if (alt) return obj[alt];
    }
    return undefined;
  };

  const name = keyOf(a, ['name', 'title', 'productName']) || '';

  let priceRaw = keyOf(a, ['price', 'amount', 'cost']);
  const price = typeof priceRaw === 'number' ? priceRaw : Number(priceRaw) || 0;

  // Description: handle rich text blocks array or plain string
  let description = keyOf(a, ['description', 'details', 'summary']);
  if (Array.isArray(description)) {
    // Rich text blocks: extract text from children
    description = description
      .map((block) => {
        if (Array.isArray(block?.children)) {
          return block.children.map((c) => c?.text || '').join('');
        }
        return '';
      })
      .join('\n')
      .trim();
  }
  if (typeof description !== 'string') description = '';

  // Images: handle flat array, nested data array, or single object
  const mediaCandidates = ['images', 'image', 'gallery', 'cover'];
  let urls = [];
  for (const fld of mediaCandidates) {
    const v = keyOf(a, [fld]);
    if (!v) continue;
    
    // Flat array of image objects with url directly
    if (Array.isArray(v) && v.length > 0 && v[0]?.url) {
      urls = v.map((img) => img?.url).filter(Boolean);
      break;
    }
    // Nested: v.data is array
    if (Array.isArray(v?.data)) {
      urls = v.data.map((d) => d?.attributes?.url || d?.url).filter(Boolean);
      break;
    }
    // Nested: v.data is single object
    if (v?.data?.attributes?.url || v?.data?.url) {
      urls = [v.data.attributes?.url || v.data.url];
      break;
    }
    // Direct url
    if (typeof v?.url === 'string') {
      urls = [v.url];
      break;
    }
  }
  const imgs = urls.map((u) => (String(u).startsWith('http') ? u : `${STRAPI_URL}${u}`));

  const rawSlug = keyOf(a, ['slug']) || slugify(name) || String(sp?.id || '');

  return {
    strapiId: sp?.id,
    name,
    slug: rawSlug,
    price,
    description,
    images: imgs,
  };
}

// Fetch all products from Strapi and upsert into MongoDB
async function syncAllFromStrapi() {
  const json = await fetchFromStrapi('/api/products?populate=*');
  const items = Array.isArray(json?.data) ? json.data : [];
  const mapped = items.map(mapStrapiProduct);

  // Upsert using strapiId if present; fallback to slug to prevent duplicates
  const ops = mapped.map((m) => {
    const filter = (m.strapiId !== undefined && m.strapiId !== null)
      ? { strapiId: m.strapiId }
      : { slug: m.slug };
    return Product.findOneAndUpdate(
      filter,
      { $set: m },
      { upsert: true, new: true }
    );
  });
  const saved = await Promise.all(ops);

  // Remove stale Strapi-sourced products that are no longer present in Strapi
  const currentIds = mapped
    .map((m) => m.strapiId)
    .filter((id) => id !== undefined && id !== null);
  if (currentIds.length > 0) {
    await Product.deleteMany({
      strapiId: { $exists: true, $nin: currentIds },
    });
  }

  return saved.length;
}

// POST /api/products/sync
exports.syncFromStrapi = async (req, res, next) => {
  try {
    const count = await syncAllFromStrapi();
    res.json({ count });
  } catch (err) {
    next(err);
  }
};

// programmatic export for server startup sync
exports.syncAllFromStrapi = syncAllFromStrapi;

// GET /api/products
exports.list = async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).lean();
    res.json({ data: products });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/:idOrSlug
exports.getOne = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    let product = null;
    const asNum = Number(idOrSlug);
    if (!Number.isNaN(asNum)) {
      product = await Product.findOne({ strapiId: asNum }).lean();
      // Only try by _id if it's a valid ObjectId string
      if (!product && mongoose.isValidObjectId(idOrSlug)) {
        product = await Product.findById(idOrSlug).lean();
      }
    } else {
      product = await Product.findOne({ slug: idOrSlug }).lean();
    }
    if (!product) return res.status(404).json({ message: 'Not found' });
    res.json({ data: product });
  } catch (err) {
    next(err);
  }
};
