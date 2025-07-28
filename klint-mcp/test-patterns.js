#!/usr/bin/env node

/**
 * Test script to verify pattern matching and output quality
 */

import { KlintContext } from "./dist/context.js";

async function testPatterns() {
  const context = new KlintContext();
  
  // Wait for initialization
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log("🧪 Testing Pattern Matching\n");
  
  const testCases = [
    { task: "create animated text", category: "text and typography" },
    { task: "make a wavy line", category: "wave patterns" },
    { task: "build particle system", category: "particles" },
    { task: "design a grid layout", category: "grids" },
    { task: "create smooth curves", category: "paths and curves" },
    { task: "blend colors together", category: "blending" },
    { task: "generate random noise", category: "noise" },
  ];
  
  for (const test of testCases) {
    console.log(`\n📍 Testing: "${test.task}"`);
    console.log(`Expected category: ${test.category}`);
    
    try {
      const result = await context.howDoI(test.task);
      
      // Extract the matched concept from the result
      const conceptMatch = result.match(/This involves \*\*([^*]+)\*\*/);
      if (conceptMatch) {
        console.log(`✅ Matched: ${conceptMatch[1]}`);
      } else {
        console.log("❌ No pattern matched");
      }
      
      // Check if functions are listed
      const functionMatches = result.match(/- \*\*(\w+)\*\*:/g);
      if (functionMatches) {
        console.log(`Functions: ${functionMatches.map(f => f.replace(/[*:-]/g, '').trim()).join(', ')}`);
      }
      
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
    }
  }
  
  console.log("\n\n🧪 Testing Specific Output\n");
  
  // Test a specific pattern in detail
  const detailedResult = await context.howDoI("create animated typography with wave effects");
  console.log("Full output for 'create animated typography with wave effects':");
  console.log("=".repeat(60));
  console.log(detailedResult);
}

testPatterns().catch(console.error);