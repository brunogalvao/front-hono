#!/usr/bin/env node

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { join } from 'path';

try {
  // Get git information
  const commitSha = execSync('git rev-parse --short HEAD', {
    encoding: 'utf8',
  }).trim();
  const commitShaFull = execSync('git rev-parse HEAD', {
    encoding: 'utf8',
  }).trim();
  const commitMessage = execSync('git log -1 --pretty=%B | head -n 1', {
    encoding: 'utf8',
  }).trim();
  const commitDate = execSync('git log -1 --format=%cd --date=short', {
    encoding: 'utf8',
  }).trim();
  const branchName = execSync('git branch --show-current', {
    encoding: 'utf8',
  }).trim();

  // Try to get tag
  let tagName = '';
  try {
    tagName = execSync('git describe --tags --exact-match 2>/dev/null', {
      encoding: 'utf8',
    }).trim();
  } catch (error) {
    // No tag found, that's ok
  }

  // Create version string
  const version = tagName || `beta - v1.0.0+${commitSha}`;
  const buildInfo = `Build: ${commitSha} | ${commitDate}`;
  const buildTime = new Date().toISOString();

  // Create version object
  const versionInfo = {
    version,
    commitSha,
    commitShaFull,
    commitMessage,
    commitDate,
    branchName,
    tagName,
    buildInfo,
    buildTime,
  };

  // Write to src/version.json
  const versionPath = join(process.cwd(), 'src', 'version.json');
  writeFileSync(versionPath, JSON.stringify(versionInfo, null, 2));

  // Also write to public/version.json for development
  const publicVersionPath = join(process.cwd(), 'public', 'version.json');
  writeFileSync(publicVersionPath, JSON.stringify(versionInfo, null, 2));

  console.log('✅ Version info generated:');
  console.log(`   Version: ${version}`);
  console.log(`   Commit: ${commitSha}`);
  console.log(`   Branch: ${branchName}`);
  console.log(`   Date: ${commitDate}`);
  console.log(`   Files: ${versionPath} and ${publicVersionPath}`);
} catch (error) {
  console.error('❌ Error generating version info:', error.message);

  // Fallback version info
  const fallbackVersion = {
    version: 'beta - v1.0.0',
    commitSha: 'dev',
    commitShaFull: 'dev',
    commitMessage: 'Development build',
    commitDate: new Date().toISOString().split('T')[0],
    branchName: 'dev',
    tagName: '',
    buildInfo: 'Development build',
    buildTime: new Date().toISOString(),
  };

  const versionPath = join(process.cwd(), 'src', 'version.json');
  writeFileSync(versionPath, JSON.stringify(fallbackVersion, null, 2));

  // Also write to public/version.json for development
  const publicVersionPath = join(process.cwd(), 'public', 'version.json');
  writeFileSync(publicVersionPath, JSON.stringify(fallbackVersion, null, 2));

  console.log('⚠️  Using fallback version info');
  console.log(`   Files: ${versionPath} and ${publicVersionPath}`);
}
