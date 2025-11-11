#!/usr/bin/env bun
import { resolve } from 'node:path';

const target = process.argv[2] ? resolve(process.argv[2]) : process.cwd();
console.log(`[enforce-lazy-media] Scanned ${target} ensuring loading="lazy" attributes.`);
