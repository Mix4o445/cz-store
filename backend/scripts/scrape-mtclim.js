import mongoose from 'mongoose';
import slugify from 'slugify';
import { Brand } from '../src/models/Brand.model.js';
import { Category } from '../src/models/Category.model.js';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/coolzone';
const DRY_RUN = process.argv.includes('--dry-run');
const FORCE = process.argv.includes('--force');

const brands = [
  { name: 'Carrier', logo: 'https://mtclim.ma/img/m/1-medium_default.jpg', order: 1 },
  { name: 'LG', logo: 'https://mtclim.ma/img/m/2-medium_default.jpg', order: 2 },
  { name: 'Midea', logo: 'https://mtclim.ma/img/m/3-medium_default.jpg', order: 3 },
  { name: 'Fitco', logo: 'https://mtclim.ma/img/m/4-medium_default.jpg', order: 4 },
  { name: 'Forane Arkema', logo: 'https://mtclim.ma/img/m/5-medium_default.jpg', order: 5 },
  { name: 'Soler & Palau', logo: 'https://mtclim.ma/img/m/6-medium_default.jpg', order: 6 },
  { name: 'Embraco', logo: 'https://mtclim.ma/img/m/7-medium_default.jpg', order: 7 },
  { name: 'Danfoss', logo: 'https://mtclim.ma/img/m/8-medium_default.jpg', order: 8 },
  { name: 'Unité Hermetique', logo: 'https://mtclim.ma/img/m/9-medium_default.jpg', order: 9 },
  { name: 'Ako', logo: 'https://mtclim.ma/img/m/10-medium_default.jpg', order: 10 },
  { name: 'Eliwell', logo: 'https://mtclim.ma/img/m/11-medium_default.jpg', order: 11 },
  { name: 'Flexiva', logo: 'https://mtclim.ma/img/m/12-medium_default.jpg', order: 12 },
  { name: 'Ebm', logo: 'https://mtclim.ma/img/m/13-medium_default.jpg', order: 13 },
  { name: 'Climalife', logo: 'https://mtclim.ma/img/m/14-medium_default.jpg', order: 14 },
  { name: 'AUX', logo: 'https://mtclim.ma/img/m/15-medium_default.jpg', order: 15 },
  { name: 'York', logo: 'https://mtclim.ma/img/m/16-medium_default.jpg', order: 16 },
  { name: 'MT VENT', logo: 'https://mtclim.ma/img/m/18-medium_default.jpg', order: 18 },
  { name: 'OTTOCOOL', logo: 'https://mtclim.ma/img/m/19-medium_default.jpg', order: 19 },
  { name: 'Value', logo: 'https://mtclim.ma/img/m/20-medium_default.jpg', order: 20 },
  { name: 'HARP', logo: 'https://mtclim.ma/img/m/21-medium_default.jpg', order: 21 },
  { name: 'LA FARGA', logo: 'https://mtclim.ma/img/m/22-medium_default.jpg', order: 22 },
  { name: 'SUNISO', logo: 'https://mtclim.ma/img/m/23-medium_default.jpg', order: 23 },
  { name: 'INGELEC', logo: 'https://mtclim.ma/img/m/24-medium_default.jpg', order: 24 },
  { name: 'CAREL', logo: 'https://mtclim.ma/img/m/26-medium_default.jpg', order: 26 },
  { name: 'HITACHI', logo: 'https://mtclim.ma/img/m/28-medium_default.jpg', order: 28 },
];

const categories = [
  { name: { fr: 'Climatisation', ar: 'تكييف' }, slug: 'climatisation', order: 1 },
  { name: { fr: 'Ventilation', ar: 'تهوية' }, slug: 'ventilation', order: 2 },
  { name: { fr: 'Réfrigération', ar: 'تبريد' }, slug: 'refrigeration', order: 3 },

  { name: { fr: 'Mono Split', ar: 'سبليت أحادي' }, slug: 'mono-split', order: 10 },
  { name: { fr: 'Multi Split', ar: 'سبليت متعدد' }, slug: 'multi-split', order: 11 },
  { name: { fr: 'Accessoires Climatiseur', ar: 'ملحقات المكيف' }, slug: 'accessoires-climatiseur', order: 12 },

  { name: { fr: 'Mural', ar: 'حائطي' }, slug: 'mural', order: 100 },
  { name: { fr: 'Gainable', ar: 'قنوات' }, slug: 'gainable', order: 101 },
  { name: { fr: 'Cassette', ar: 'كاسيت' }, slug: 'cassette', order: 102 },
  { name: { fr: 'Console', ar: 'كونسول' }, slug: 'console', order: 103 },
  { name: { fr: 'Armoire', ar: 'خزانة' }, slug: 'armoire', order: 104 },
  { name: { fr: 'Mobile', ar: 'محمول' }, slug: 'mobile', order: 105 },
  { name: { fr: 'Déshumidificateur', ar: 'مزيل رطوبة' }, slug: 'deshumidificateur', order: 106 },
  { name: { fr: 'Black Miroir', ar: 'مرآة سوداء' }, slug: 'black-miroir', order: 107 },

  { name: { fr: 'Multi Cassette', ar: 'كاسيت متعدد' }, slug: 'multi-cassette', order: 108 },
  { name: { fr: 'Multi Muraux', ar: 'حائطي متعدد' }, slug: 'multi-muraux', order: 109 },
  { name: { fr: 'Multi Gainable', ar: 'قنوات متعددة' }, slug: 'multi-gainable', order: 110 },
  { name: { fr: 'Unité Extérieure', ar: 'وحدة خارجية' }, slug: 'unite-exterieure', order: 111 },

  { name: { fr: 'Caissons et Ventilateurs', ar: 'خزانات ومراوح' }, slug: 'caissons-et-ventilateurs', order: 200 },
  { name: { fr: 'Conduits Circulaires et Accessoires', ar: 'قنوات دائرية وملحقات' }, slug: 'conduits-circulaires-et-accessoires', order: 201 },
  { name: { fr: 'Diffusion d\'air', ar: 'توزيع الهواء' }, slug: 'diffusion-d-air', order: 202 },
  { name: { fr: 'Ventilateurs', ar: 'مراوح' }, slug: 'ventilateurs', order: 203 },
  { name: { fr: 'Filtre Électrostatique', ar: 'مرشح كهربائي' }, slug: 'filtre-electrostatique', order: 204 },

  { name: { fr: 'Caissons à Entraînement Direct', ar: 'خزانات قيادة مباشرة' }, slug: 'caissons-entrainement-direct', order: 210 },
  { name: { fr: 'Caissons Poulie et Courroie', ar: 'خزانات بكرية وحزام' }, slug: 'caissons-poulie-courroie', order: 211 },
  { name: { fr: 'Caissons de Désenfumage', ar: 'خزانات طرد الدخان' }, slug: 'caissons-desenfumage', order: 212 },

  { name: { fr: 'Accessoires en Tôle', ar: 'ملحقات صفيح معدني' }, slug: 'accessoires-en-tole', order: 213 },
  { name: { fr: 'Flexible Isolé', ar: 'مرن معزول' }, slug: 'flexible-isole', order: 214 },
  { name: { fr: 'Flexible Souple', ar: 'مرن لين' }, slug: 'flexible-souple', order: 215 },

  { name: { fr: 'Grille', ar: 'شبكة' }, slug: 'grille', order: 216 },
  { name: { fr: 'Diffuseur', ar: 'موزع' }, slug: 'diffuseur', order: 217 },
  { name: { fr: 'Ventouse', ar: 'مكبس' }, slug: 'ventouse', order: 218 },
  { name: { fr: 'Diffuseur sur Platine', ar: 'موزع على لوحة' }, slug: 'diffuseur-sur-platine', order: 219 },

  { name: { fr: 'Compresseurs Frigorifiques', ar: 'ضواغط تبريد' }, slug: 'compresseurs-frigorifiques', order: 300 },
  { name: { fr: 'Fluide Frigorigène', ar: 'سائل تبريد' }, slug: 'fluide-frigorigene', order: 301 },
  { name: { fr: 'Isolation', ar: 'عزل' }, slug: 'isolation', order: 302 },
  { name: { fr: 'Évaporateurs', ar: 'مبخرات' }, slug: 'evaporateurs', order: 303 },
  { name: { fr: 'Huile Frigorifiques', ar: 'زيت تبريد' }, slug: 'huile-frigorifiques', order: 304 },
  { name: { fr: 'Outillages', ar: 'أدوات' }, slug: 'outillages', order: 305 },
  { name: { fr: 'Tubes en Cuivre', ar: 'أنابيب نحاس' }, slug: 'tubes-en-cuivre', order: 306 },
  { name: { fr: 'Régulation', ar: 'تنظيم' }, slug: 'regulation', order: 307 },
  { name: { fr: 'Condenseurs', ar: 'مكثفات' }, slug: 'condenseurs', order: 308 },
  { name: { fr: 'Accessoires en Cuivre', ar: 'ملحقات نحاس' }, slug: 'accessoires-en-cuivre', order: 309 },
  { name: { fr: 'Groupe de Condensation', ar: 'مجموعة تكثيف' }, slug: 'groupe-de-condensation', order: 310 },
  { name: { fr: 'Câbles', ar: 'كابلات' }, slug: 'cables', order: 311 },

  { name: { fr: 'Compresseurs', ar: 'ضواغط' }, slug: 'compresseurs', order: 320 },
  { name: { fr: 'Forane', ar: 'فوران' }, slug: 'forane', order: 321 },
  { name: { fr: 'HARP', ar: 'هارب' }, slug: 'harp-fluide', order: 322 },
  { name: { fr: 'FRIO+', ar: 'فريو+' }, slug: 'frio', order: 323 },

  { name: { fr: 'Isolant Thermique', ar: 'عزل حراري' }, slug: 'isolant-thermique', order: 330 },
  { name: { fr: 'Scotch Aluminium', ar: 'شريط ألمنيوم' }, slug: 'scotch-aluminium', order: 331 },
  { name: { fr: 'Bande Adhésive', ar: 'شريط لاصق' }, slug: 'bande-adhesive', order: 332 },
  { name: { fr: 'Armaflex', ar: 'أرمافليكس' }, slug: 'armaflex', order: 333 },
  { name: { fr: 'Matelaflex', ar: 'ماتيلافيكس' }, slug: 'matelaflex', order: 334 },
  { name: { fr: 'Scotch Grise', ar: 'شريط رمادي' }, slug: 'scotch-grise', order: 335 },

  { name: { fr: 'Évaporateurs Cubique', ar: 'مبخرات مكعبة' }, slug: 'evaporateurs-cubique', order: 340 },
  { name: { fr: 'Évaporateurs Extra Plat', ar: 'مبخرات مسطحة' }, slug: 'evaporateurs-extra-plat', order: 341 },
  { name: { fr: 'Évaporateur Double Flux', ar: 'مبخر تدفق مزدوج' }, slug: 'evaporateur-double-flux', order: 342 },

  { name: { fr: 'Suniso SL32', ar: 'سونيسو SL32' }, slug: 'suniso-sl-32', order: 350 },
  { name: { fr: 'Suniso 4GS', ar: 'سونيسو 4GS' }, slug: 'suniso-4gs', order: 351 },
  { name: { fr: 'Suniso 3GS', ar: 'سونيسو 3GS' }, slug: 'suniso-3gs', order: 352 },
  { name: { fr: 'Harp MO 3E', ar: 'هارب MO 3E' }, slug: 'harp-mo-3e', order: 353 },

  { name: { fr: 'Dudgeonnières', ar: 'أدواتت توسيع الأنابيب' }, slug: 'dudgeonnieres', order: 360 },
  { name: { fr: 'Coupe-Tubes', ar: 'قواطع أنابيب' }, slug: 'coupe-tubes', order: 361 },
  { name: { fr: 'Manomètres', ar: 'مقاييس ضغط' }, slug: 'manometres', order: 362 },
  { name: { fr: 'Pompes à Vide', ar: 'مضخات فراغ' }, slug: 'pompes-a-vide', order: 363 },
  { name: { fr: 'Chalumeau à Gaz', ar: 'مشعل غاز' }, slug: 'chalumeau-a-gaz', order: 364 },
  { name: { fr: 'Thermomètre Infrarouge', ar: 'ميزان حرارة بالأشعة تحت الحمراء' }, slug: 'thermometre-infrarouge', order: 365 },
  { name: { fr: 'Additif Stop Fuites', ar: 'مادة إيقاف التسرب' }, slug: 'additif-stop-fuites', order: 366 },
  { name: { fr: 'Évaseur et Kit Évaseur', ar: 'أداة توسيع وعدة توسيع' }, slug: 'evaseur-et-kit-evaseur', order: 367 },

  { name: { fr: 'Tube Cuivre en Rouleaux', ar: 'أنبوب نحاس ملفوف' }, slug: 'tube-cuivre-en-rouleaux', order: 370 },
  { name: { fr: 'Tube Cuivre en Barres', ar: 'أنبوب نحاس قضبان' }, slug: 'tube-cuivre-en-barres', order: 371 },
  { name: { fr: 'Tube Cuivre Isolé', ar: 'أنبوب نحاس معزول' }, slug: 'tube-cuivre-isole', order: 372 },

  { name: { fr: 'Régulateur Électronique', ar: 'منظم إلكتروني' }, slug: 'regulateur-electronique', order: 380 },
  { name: { fr: 'Détendeurs Thermostatiques', ar: 'صمامات تمدد حرارية' }, slug: 'detendeurs-thermostatiques', order: 381 },
  { name: { fr: 'Électrovannes', ar: 'صمامات كهربائية' }, slug: 'electrovannes', order: 382 },
  { name: { fr: 'Pressostats', ar: 'مفاتيح ضغط' }, slug: 'pressostats', order: 383 },
  { name: { fr: 'Voyants Liquides', ar: 'نوافذ سائل' }, slug: 'voyants-liquides', order: 384 },
  { name: { fr: 'Filtres Déshydrateurs', ar: 'فلاتر تجفيف' }, slug: 'filtres-deshydrateurs', order: 385 },
  { name: { fr: 'Thermostats Ménagers', ar: 'ترموستات منزلية' }, slug: 'thermostats-menagers', order: 386 },
  { name: { fr: 'Thermostats Universels', ar: 'ترموستات عالمية' }, slug: 'thermostats-universels', order: 387 },
  { name: { fr: 'Thermostats pour Clapet', ar: 'ترموستات صمام' }, slug: 'thermostats-pour-clapet', order: 388 },

  { name: { fr: 'Coudes en Cuivre', ar: 'أكواع نحاس' }, slug: 'coudes-en-cuivre', order: 390 },
  { name: { fr: 'Té en Cuivre', ar: 'تي نحاس' }, slug: 'te-en-cuivre', order: 391 },
  { name: { fr: 'Siphon en Cuivre', ar: 'سيفون نحاس' }, slug: 'siphon-en-cuivre', order: 392 },
  { name: { fr: 'Manchon en Cuivre', ar: 'وصلة نحاس' }, slug: 'manchon-en-cuivre', order: 393 },

  { name: { fr: 'Groupe Normal', ar: 'مجموعة عادية' }, slug: 'groupe-normal', order: 400 },
  { name: { fr: 'Groupe Carrossé', ar: 'مجموعة مغطاة' }, slug: 'groupe-carrosse', order: 401 },
  { name: { fr: 'Groupe Silencieux', ar: 'مجموعة هادئة' }, slug: 'groupe-silencieux', order: 402 },

  { name: { fr: 'Câble Souple', ar: 'كابل مرن' }, slug: 'cable-souple', order: 410 },
];

async function seedBrands() {
  console.log(`\n=== Seeding ${brands.length} Brands ===`);
  let created = 0;
  let skipped = 0;

  for (const brandData of brands) {
    const slug = slugify(brandData.name, { lower: true, strict: true });
    const existing = await Brand.findOne({ $or: [{ name: brandData.name }, { slug }] });
    if (existing && !FORCE) {
      console.log(`  [SKIP] Brand "${brandData.name}" already exists`);
      skipped++;
      continue;
    }
    if (existing && FORCE) {
      await Brand.deleteOne({ _id: existing._id });
      console.log(`  [FORCE] Deleted existing brand "${brandData.name}"`);
    }
    if (DRY_RUN) {
      console.log(`  [DRY] Would create brand "${brandData.name}" (slug: ${slugify(brandData.name, { lower: true, strict: true })})`);
      created++;
      continue;
    }
    const brand = await Brand.create({
      name: brandData.name,
      slug: slugify(brandData.name, { lower: true, strict: true }),
      logo: brandData.logo,
      order: brandData.order,
    });
    console.log(`  [CREATE] Brand "${brand.name}" (slug: ${brand.slug})`);
    created++;
  }

  console.log(`\nBrands: ${created} created, ${skipped} skipped`);
  return { created, skipped };
}

async function seedCategories() {
  console.log(`\n=== Seeding ${categories.length} Categories ===`);
  let created = 0;
  let skipped = 0;

  for (const catData of categories) {
    const slug = catData.slug || slugify(catData.name.fr, { lower: true, strict: true });
    const existing = await Category.findOne({ slug });
    if (existing && !FORCE) {
      console.log(`  [SKIP] Category "${catData.name.fr}" already exists (slug: ${slug})`);
      skipped++;
      continue;
    }
    if (existing && FORCE) {
      await Category.deleteOne({ _id: existing._id });
      console.log(`  [FORCE] Deleted existing category "${catData.name.fr}"`);
    }
    if (DRY_RUN) {
      console.log(`  [DRY] Would create category "${catData.name.fr}" (slug: ${slug})`);
      created++;
      continue;
    }
    const category = await Category.create({
      name: catData.name,
      slug,
      order: catData.order,
    });
    console.log(`  [CREATE] Category "${category.name.fr}" (slug: ${category.slug})`);
    created++;
  }

  console.log(`\nCategories: ${created} created, ${skipped} skipped`);
  return { created, skipped };
}

async function main() {
  console.log('========================================');
  console.log('  MT Clim Scraper - Brand & Category Seeder');
  console.log('========================================');
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no DB writes)' : 'LIVE'}`);
  console.log(`Force: ${FORCE ? 'YES (overwrite existing)' : 'NO (skip existing)'}`);
  console.log(`MongoDB: ${MONGO_URI}`);

  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('[db] Connected to MongoDB');

    const brandResult = await seedBrands();
    const catResult = await seedCategories();

    console.log('\n========================================');
    console.log('  Summary');
    console.log('========================================');
    console.log(`Brands:    ${brandResult.created} created, ${brandResult.skipped} skipped`);
    console.log(`Categories: ${catResult.created} created, ${catResult.skipped} skipped`);
  } catch (err) {
    console.error('[ERROR]', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('[db] Disconnected');
  }
}

main();