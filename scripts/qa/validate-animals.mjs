#!/usr/bin/env node
/**
 * Validation Script for animals.json
 * Checks that all 60 Saju archetypes are complete and valid
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Expected 60 pillar codes (matching PILLAR_CODES in saju.ts)
const EXPECTED_CODES = [
  "GAP_JA", "EUL_CHUK", "BYEONG_IN", "JEONG_MYO", "MU_JIN", "GI_SA", "GYEONG_O", "SIN_MI", "IM_SIN", "GYE_YU",
  "GAP_SUL", "EUL_HAE", "BYEONG_JA", "JEONG_CHUK", "MU_IN", "GI_MYO", "GYEONG_JIN", "SIN_SA", "IM_O", "GYE_MI",
  "GAP_SIN", "EUL_YU", "BYEONG_SUL", "JEONG_HAE", "MU_JA", "GI_CHUK", "GYEONG_IN", "SIN_MYO", "IM_JIN", "GYE_SA",
  "GAP_O", "EUL_MI", "BYEONG_SIN", "JEONG_YU", "MU_SUL", "GI_HAE", "GYEONG_JA", "SIN_CHUK", "IM_IN", "GYE_MYO",
  "GAP_JIN", "EUL_SA", "BYEONG_O", "JEONG_MI", "MU_SIN", "GI_YU", "GYEONG_SUL", "SIN_HAE", "IM_JA", "GYE_CHUK",
  "GAP_IN", "EUL_MYO", "BYEONG_JIN", "JEONG_SA", "MU_O", "GI_MI", "GYEONG_SIN", "SIN_YU", "IM_SUL", "GYE_HAE",
];

const AGE_GROUPS = ["10s", "20s", "30s"];

function main() {
  console.log("🔍 Validating animals.json...\n");

  // Read animals.json
  const animalsPath = join(__dirname, '../src/data/animals.json');
  const data = JSON.parse(readFileSync(animalsPath, 'utf-8'));

  if (!data.archetypes || !Array.isArray(data.archetypes)) {
    console.error("❌ ERROR: 'archetypes' array not found in animals.json");
    process.exit(1);
  }

  const archetypes = data.archetypes;
  const errors = [];
  const warnings = [];
  const codeSet = new Set(archetypes.map(a => a.code));

  // Check count
  console.log(`📊 Found ${archetypes.length} archetypes (expected 60)\n`);

  // Check for missing codes
  const missingCodes = EXPECTED_CODES.filter(code => !codeSet.has(code));
  if (missingCodes.length > 0) {
    errors.push(`Missing codes: ${missingCodes.join(', ')}`);
  }

  // Check for extra/unknown codes
  const unknownCodes = archetypes.filter(a => !EXPECTED_CODES.includes(a.code)).map(a => a.code);
  if (unknownCodes.length > 0) {
    warnings.push(`Unknown codes: ${unknownCodes.join(', ')}`);
  }

  // Validate each archetype
  archetypes.forEach((archetype, index) => {
    const prefix = `[${index}] ${archetype.code}`;

    // Check required fields
    if (!archetype.animal_name || archetype.animal_name.trim() === '') {
      errors.push(`${prefix}: Missing or empty 'animal_name'`);
    }

    if (!archetype.base_traits) {
      errors.push(`${prefix}: Missing 'base_traits'`);
    } else {
      if (!archetype.base_traits.mask || archetype.base_traits.mask.trim() === '') {
        errors.push(`${prefix}: Missing or empty 'base_traits.mask'`);
      }
      if (!Array.isArray(archetype.base_traits.hashtags) || archetype.base_traits.hashtags.length === 0) {
        errors.push(`${prefix}: 'base_traits.hashtags' must be a non-empty array`);
      } else if (archetype.base_traits.hashtags.some(tag => !tag || tag.trim() === '')) {
        errors.push(`${prefix}: Some hashtags are empty`);
      }
    }

    if (!archetype.age_context) {
      errors.push(`${prefix}: Missing 'age_context'`);
    } else {
      AGE_GROUPS.forEach(age => {
        if (!archetype.age_context[age]) {
          errors.push(`${prefix}: Missing age_context['${age}']`);
        } else {
          if (!archetype.age_context[age].hook || archetype.age_context[age].hook.trim() === '') {
            errors.push(`${prefix}: Empty age_context['${age}'].hook`);
          }
          if (!archetype.age_context[age].secret_preview || archetype.age_context[age].secret_preview.trim() === '') {
            errors.push(`${prefix}: Empty age_context['${age}'].secret_preview`);
          }
        }
      });
    }
  });

  // Results
  console.log("═══════════════════════════════════════\n");

  if (warnings.length > 0) {
    console.log("⚠️  WARNINGS:\n");
    warnings.forEach(w => console.log(`   ${w}`));
    console.log();
  }

  if (errors.length > 0) {
    console.log("❌ ERRORS FOUND:\n");
    errors.forEach(e => console.log(`   ${e}`));
    console.log(`\n💥 Validation FAILED with ${errors.length} error(s)\n`);
    process.exit(1);
  }

  console.log("✅ All 60 archetypes are valid!\n");
  console.log("═══════════════════════════════════════\n");
  console.log("Summary:");
  console.log(`  • Total Archetypes: ${archetypes.length}`);
  console.log(`  • All codes present: ✓`);
  console.log(`  • All fields complete: ✓`);
  console.log(`  • Age contexts (10s/20s/30s): ✓`);
  console.log("\n🎉 Data quality check PASSED!\n");
}

main();
