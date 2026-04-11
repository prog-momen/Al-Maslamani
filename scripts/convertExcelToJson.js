console.log('🚀 Starting converter...');

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Check if Excel file exists
const excelPath = path.join(__dirname, '..', 'products.xlsx');
console.log('📂 Looking for Excel file at:', excelPath);

if (!fs.existsSync(excelPath)) {
  console.error('❌ Excel file not found! Please place products.xlsx in the project root.');
  process.exit(1);
}

console.log('✅ Excel file found!');

// Read the Excel file
console.log('📖 Reading Excel file...');
const workbook = XLSX.readFile(excelPath);
const sheetName = workbook.SheetNames[0];
console.log('📋 Sheet name:', sheetName);

const worksheet = workbook.Sheets[sheetName];

// Convert to JSON
console.log('🔄 Converting to JSON...');
const rawData = XLSX.utils.sheet_to_json(worksheet);
console.log(`📊 Found ${rawData.length} rows`);

// Transform to our app's format
const products = rawData.map((item, index) => {
  let imageUrl = item['الصورة'] || '';
  let fileId = '';
  
  if (imageUrl.includes('/d/')) {
    fileId = imageUrl.split('/d/')[1]?.split('/')[0] || '';
  } else if (imageUrl.includes('id=')) {
    fileId = imageUrl.split('id=')[1]?.split('&')[0] || '';
  }
  
  const directImageUrl = fileId 
    ? `https://drive.google.com/thumbnail?id=${fileId}&sz=w500`
    : 'https://via.placeholder.com/500?text=No+Image';

  return {
    id: String(index + 1),
    name: item['الاسم'] || '',
    nameAr: item['الاسم'] || '',
    category: item['النوع'] || '',
    price: 35,
    weight: item['الحجم'] || '',
    description: `${item['الاسم']} - ${item['النوع']}`,
    descriptionAr: `${item['الاسم']} - ${item['النوع']}`,
    imageUrl: directImageUrl,
    inStock: true,
    isFeatured: index < 8,
  };
});

console.log(`✨ Transformed ${products.length} products`);

// Save as JSON
const outputDir = path.join(__dirname, '..', 'assets', 'data');
console.log('📁 Creating output directory:', outputDir);

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log('✅ Created output directory');
}

const outputPath = path.join(outputDir, 'products.json');
fs.writeFileSync(outputPath, JSON.stringify({ products }, null, 2));

console.log(`✅ SUCCESS! Converted ${products.length} products to JSON!`);
console.log(`📁 Saved to: ${outputPath}`);