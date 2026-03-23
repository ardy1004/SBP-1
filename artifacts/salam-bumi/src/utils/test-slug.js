const { generateSlug, calculateSEOScore, validateSlug } = require('./slugGenerator.js');

const tests = [
  { title: 'Rumah Mewah 2 Lantai di Sleman Dekat UGM', type: 'Rumah', location: 'Sleman', code: 'R3.27' },
  { title: 'Kost Putri Exclusive 14 Kamar, Strategis!', type: 'Kost', location: 'Yogyakarta', code: 'K2.36' },
  { title: 'Tanah Strategis Pinggir Jalan Dewi Sartika', type: 'Tanah', location: 'Klaten', code: 'T33' },
];

console.log('=== SLUG GENERATOR TEST ===\n');
tests.forEach((t, i) => {
  const slug = generateSlug({ title: t.title, propertyType: t.type, location: t.location, listingCode: t.code });
  const score = calculateSEOScore(slug);
  const validation = validateSlug(slug);
  
  console.log(`Test ${i+1}:`);
  console.log(`  Title: ${t.title}`);
  console.log(`  Type: ${t.type}`);
  console.log(`  Location: ${t.location}`);
  console.log(`  Code: ${t.code}`);
  console.log(`  Slug: ${slug}`);
  console.log(`  Score: ${score}/100`);
  console.log(`  Valid: ${validation.isValid ? '✅' : '❌'}`);
  if (!validation.isValid) {
    console.log(`  Errors: ${validation.errors.join(', ')}`);
  }
  console.log('');
});
