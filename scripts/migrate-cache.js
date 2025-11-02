/**
 * Cache Migration Script
 *
 * Migrates image cache from flat structure (cache/images/) to organized structure
 * Supports: skins, agents, music kits, keychains, stickers
 *
 * Usage: node scripts/migrate-cache.js
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

const CACHE_ROOT = path.join(process.cwd(), 'public', 'cache');
const OLD_CACHE_DIR = path.join(CACHE_ROOT, 'images');
const DATA_DIR = path.join(process.cwd(), 'data');

/**
 * Sanitize category/weapon name for filesystem
 */
function sanitizeName(name) {
  return name.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
}

/**
 * Generate MD5 hash for URL (same as API does)
 */
function hashUrl(url) {
  return crypto.createHash('md5').update(url).digest('hex');
}

/**
 * Determine cache location for different data types
 */
function getCacheLocation(item) {
  // Weapon skins: category/weapon_name
  if (item.category && item.weapon_name) {
    return {
      category: sanitizeName(item.category),
      subcategory: sanitizeName(item.weapon_name),
    };
  }

  // Agents: agents/team
  if (item.team !== undefined && item.model) {
    const teamName = item.team === 2 ? 'terrorists' : item.team === 3 ? 'counter-terrorists' : 'unknown';
    return {
      category: 'agents',
      subcategory: teamName,
    };
  }

  // Music Kits: music-kits/
  if (item.id && item.id.startsWith('music_kit-')) {
    return {
      category: 'music-kits',
      subcategory: undefined,
    };
  }

  // Keychains: keychains/collection_name
  if (item.id && item.id.startsWith('keychain-') && item.collections && item.collections.length > 0) {
    const collectionName = item.collections[0].name
      .replace(/Charm Collection/gi, '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '_');
    return {
      category: 'keychains',
      subcategory: collectionName,
    };
  }

  // Stickers: stickers/tournament_name or stickers/type
  if (item.id && item.id.startsWith('sticker-')) {
    let subcategory = 'other';

    if (item.tournament && item.tournament.name) {
      subcategory = item.tournament.name.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    } else if (item.type) {
      subcategory = item.type.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    }

    return {
      category: 'stickers',
      subcategory: subcategory,
    };
  }

  return null;
}

/**
 * Main migration function
 */
async function migrateCache() {
  console.log('Starting cache migration...\n');

  try {
    // Check if old cache directory exists
    try {
      await fs.access(OLD_CACHE_DIR);
    } catch (error) {
      console.log('No old cache directory found. Nothing to migrate.');
      return;
    }

    // Build a map of URL hash to category/subcategory
    console.log('Building URL hash map from all data sources...\n');
    const hashMap = new Map();

    // Load skins
    try {
      console.log('Loading skins data...');
      const skinsPath = path.join(DATA_DIR, 'skins.json');
      const skinsData = JSON.parse(await fs.readFile(skinsPath, 'utf8'));
      console.log(`Loaded ${skinsData.length} skins`);

      for (const item of skinsData) {
        if (item.image) {
          const hash = hashUrl(item.image);
          const location = getCacheLocation(item);
          if (location) {
            hashMap.set(hash, location);
          }
        }
      }
    } catch (error) {
      console.log('Warning: Could not load skins.json');
    }

    // Load agents
    try {
      console.log('Loading agents data...');
      const agentsPath = path.join(DATA_DIR, 'agents.json');
      const agentsData = JSON.parse(await fs.readFile(agentsPath, 'utf8'));
      console.log(`Loaded ${agentsData.length} agents`);

      for (const item of agentsData) {
        if (item.image) {
          const hash = hashUrl(item.image);
          const location = getCacheLocation(item);
          if (location) {
            hashMap.set(hash, location);
          }
        }
      }
    } catch (error) {
      console.log('Warning: Could not load agents.json');
    }

    // Load music kits
    try {
      console.log('Loading music kits data...');
      const musicPath = path.join(DATA_DIR, 'music_kits.json');
      const musicData = JSON.parse(await fs.readFile(musicPath, 'utf8'));
      console.log(`Loaded ${musicData.length} music kits`);

      for (const item of musicData) {
        if (item.image) {
          const hash = hashUrl(item.image);
          const location = getCacheLocation(item);
          if (location) {
            hashMap.set(hash, location);
          }
        }
      }
    } catch (error) {
      console.log('Warning: Could not load music_kits.json');
    }

    // Load keychains
    try {
      console.log('Loading keychains data...');
      const keychainsPath = path.join(DATA_DIR, 'keychains.json');
      const keychainsData = JSON.parse(await fs.readFile(keychainsPath, 'utf8'));
      console.log(`Loaded ${keychainsData.length} keychains`);

      for (const item of keychainsData) {
        if (item.image) {
          const hash = hashUrl(item.image);
          const location = getCacheLocation(item);
          if (location) {
            hashMap.set(hash, location);
          }
        }
      }
    } catch (error) {
      console.log('Warning: Could not load keychains.json');
    }

    // Load stickers
    try {
      console.log('Loading stickers data...');
      const stickersPath = path.join(DATA_DIR, 'stickers.json');
      const stickersData = JSON.parse(await fs.readFile(stickersPath, 'utf8'));
      console.log(`Loaded ${stickersData.length} stickers`);

      for (const item of stickersData) {
        if (item.image) {
          const hash = hashUrl(item.image);
          const location = getCacheLocation(item);
          if (location) {
            hashMap.set(hash, location);
          }
        }
      }
    } catch (error) {
      console.log('Warning: Could not load stickers.json');
    }

    console.log(`\nTotal mapped URLs: ${hashMap.size}\n`);

    // Get all files in old cache directory
    console.log('Reading old cache directory...');
    const files = await fs.readdir(OLD_CACHE_DIR);
    console.log(`Found ${files.length} cached files\n`);

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    // Process each file
    for (const fileName of files) {
      const oldPath = path.join(OLD_CACHE_DIR, fileName);

      // Skip if not a file
      const stat = await fs.stat(oldPath);
      if (!stat.isFile()) {
        continue;
      }

      // Extract hash from filename (remove extension)
      const hash = path.parse(fileName).name;

      // Look up category and subcategory
      const location = hashMap.get(hash);

      if (location) {
        // Build new path
        let newPath;
        if (location.subcategory) {
          const newDir = path.join(CACHE_ROOT, location.category, location.subcategory);
          newPath = path.join(newDir, fileName);
          await fs.mkdir(newDir, { recursive: true });
          console.log(`✓ Migrated: ${fileName} -> ${location.category}/${location.subcategory}/`);
        } else {
          const newDir = path.join(CACHE_ROOT, location.category);
          newPath = path.join(newDir, fileName);
          await fs.mkdir(newDir, { recursive: true });
          console.log(`✓ Migrated: ${fileName} -> ${location.category}/`);
        }

        try {
          // Copy file to new location
          await fs.copyFile(oldPath, newPath);
          migratedCount++;

          // Optionally delete old file after successful copy
          // await fs.unlink(oldPath);
        } catch (error) {
          console.error(`✗ Error migrating ${fileName}:`, error.message);
          errorCount++;
        }
      } else {
        console.log(`⊘ Skipped: ${fileName} (no mapping found)`);
        skippedCount++;
      }
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('Migration Summary:');
    console.log('='.repeat(50));
    console.log(`Total files:     ${files.length}`);
    console.log(`Migrated:        ${migratedCount}`);
    console.log(`Skipped:         ${skippedCount}`);
    console.log(`Errors:          ${errorCount}`);
    console.log('='.repeat(50));
    console.log('\nNote: Original files in cache/images/ have been preserved.');
    console.log('You can safely delete them after verifying the migration.');
    console.log('\nTo delete old cache:');
    console.log('  rm -rf public/cache/images/*');

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateCache().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
