#!/usr/bin/env bun

// Load env
import { $, sleep } from 'bun'
import fs from 'node:fs'
import path from 'node:path'
import yoctoSpinner from 'yocto-spinner';

const work_dir = process.cwd()
const assignDir = (Bun.argv.slice(2))[0]
let scaffold = work_dir
if (assignDir) scaffold = assignDir
scaffold = path.resolve(scaffold)

// Start ricing process

if (fs.existsSync(scaffold)) {
    if (!(fs.readdirSync(scaffold).length === 0)) { console.error(`Directory not empty, abort`); process.exit(1) } // Handle dir is not empty
}


// Git clone the spin-up template
try {
    const gitSpinner = yoctoSpinner({ text: 'Cloning Template…', color: 'yellow' }).start();
    await $`git clone https://github.com/kwaitsing/urn-lite-template.git --depth 1 ${scaffold}`.quiet()
    gitSpinner.stop()

    const bunSpinner = yoctoSpinner({ text: 'Installing Modules…', color: 'yellow' }).start();
    await $`cd ${scaffold} && bun install`.quiet()
    bunSpinner.stop()
    // Modify the template
    const fsSpinner = yoctoSpinner({ text: 'Finalizing Filesystem…', color: 'yellow' }).start();
    fs.rmSync(`${scaffold}/.git`, { recursive: true, force: true })
    const dirName = path.basename(scaffold)
    let contents = await Bun.file(`${scaffold}/package.json`).json();
    contents.name = dirName
    await Bun.write(`${scaffold}/package.json`, JSON.stringify(contents, null, 2));
    fsSpinner.stop()
} catch (err) {
    console.error(`Something went wrong ${err}`)
}

console.log(`Successfully bootstrap the URN Lite instance
    
cd ${scaffold}
bun run dev
    
To start the dev server`)
