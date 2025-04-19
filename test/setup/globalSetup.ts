import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

export async function setup() {
  console.log('\n🕒 Starting global test setup...');
  console.log('✅ Using in-memory PostgreSQL database');
}

export async function teardown() {
  console.log('\n🧹 Global test teardown complete');
} 