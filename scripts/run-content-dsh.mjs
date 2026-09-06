#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const projectRoot = process.cwd();
const engine = process.env.BENCHMARK_GATE || resolve(homedir(), 'Documents/scripts/benchmark_gate.py');
const rubric = resolve(projectRoot, 'verification/contracts/public-content/docs/rubric.yaml');
const current = resolve(projectRoot, 'src/data/generated/public-content.json');
const good = resolve(projectRoot, 'verification/contracts/public-content/benchmark/artifacts/_golden/good.json');
const bad = resolve(projectRoot, 'verification/contracts/public-content/benchmark/artifacts/_golden/bad.json');

if (!existsSync(engine)) {
  console.error(`content-dsh error: benchmark_gate.py not found at ${engine}`);
  process.exit(1);
}

function run(args) {
  const result = spawnSync('python3', [engine, ...args], { cwd: projectRoot, encoding: 'utf8' });
  if (result.status !== 0) {
    process.stderr.write(result.stdout || '');
    process.stderr.write(result.stderr || '');
    process.exit(1);
  }
  return result.stdout;
}


process.stdout.write(run(['validate-rubric', '--rubric', rubric]));
const currentResult = run(['run', '--artifact', current, '--rubric', rubric, '--json']);
const goodResult = run(['run', '--artifact', good, '--rubric', rubric, '--json']);
const badResult = run(['run', '--artifact', bad, '--rubric', rubric, '--json']);
if (JSON.parse(currentResult).score.verdict !== 'PASS') throw new Error('current projection failed DSH');
if (JSON.parse(goodResult).score.verdict !== 'PASS') throw new Error('golden-good failed DSH');
if (JSON.parse(badResult).score.verdict !== 'FAIL') throw new Error('golden-bad was not rejected');
console.log('content-dsh: current + golden-good PASS; golden-bad rejected');
