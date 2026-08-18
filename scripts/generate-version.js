#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

function readGit(args, fallback = '') {
  try {
    return execFileSync('git', args, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return fallback;
  }
}

const environment = process.env;
const commitShaFull =
  environment.VERCEL_GIT_COMMIT_SHA ||
  environment.GITHUB_SHA ||
  readGit(['rev-parse', 'HEAD'], 'dev');
const commitSha = commitShaFull === 'dev' ? 'dev' : commitShaFull.slice(0, 7);
const commitMessage =
  environment.VERCEL_GIT_COMMIT_MESSAGE ||
  readGit(['log', '-1', '--pretty=%s'], 'Development build');
const commitDate = readGit(
  ['log', '-1', '--format=%cs'],
  new Date().toISOString().slice(0, 10)
);
const branchName =
  environment.VERCEL_GIT_COMMIT_REF ||
  environment.GITHUB_REF_NAME ||
  readGit(['branch', '--show-current'], 'dev');
const tagName =
  environment.GITHUB_REF_TYPE === 'tag'
    ? environment.GITHUB_REF_NAME || ''
    : readGit(['describe', '--tags', '--exact-match'], '');
const version = tagName || `beta - v1.0.0+${commitSha}`;

const versionInfo = {
  version,
  commitSha,
  commitShaFull,
  commitMessage,
  commitDate,
  branchName,
  tagName,
  buildInfo: `Build: ${commitSha} | ${commitDate}`,
  buildTime: new Date().toISOString(),
};

const versionPath = join(process.cwd(), 'public', 'version.json');
writeFileSync(versionPath, `${JSON.stringify(versionInfo, null, 2)}\n`);

console.log(`Version info generated: ${version} (${branchName})`);
