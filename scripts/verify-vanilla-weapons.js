#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const skinsPath = path.join(__dirname, '..', 'data', 'skins.json');
const skins = JSON.parse(fs.readFileSync(skinsPath, 'utf-8'));

const vanillaWeapons = skins.filter(s =>
  s.paint === 0 && s.category !== 'Knives' && s.category !== 'Gloves'
);

console.log('Vanilla weapons (non-knife, non-glove):');
console.log(`Total: ${vanillaWeapons.length}\n`);

const byCategory = {};
vanillaWeapons.forEach(w => {
  if (!byCategory[w.category]) {
    byCategory[w.category] = [];
  }
  byCategory[w.category].push(w.paint_name);
});

Object.entries(byCategory).forEach(([category, weapons]) => {
  console.log(`${category} (${weapons.length}):`);
  weapons.forEach(name => console.log(`  - ${name}`));
  console.log('');
});
