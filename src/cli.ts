#!/usr/bin/env node

import fs from 'fs-extra';
import { DJMix, exportToFCPXML } from './index';

/**
 * Reads and parses a DJ Mix JSON file.
 * @param {string} inputFile - The path to the input JSON file.
 * @returns {Promise<DJMix>} A promise that resolves to the parsed DJ Mix data.
 * @throws Will throw an error if the file cannot be read or parsed.
 */
async function readDjMixFile(inputFile: string): Promise<DJMix> {
    try {
        const jsonData = await fs.readJSON(inputFile) as DJMix;
        return jsonData;
    } catch (error) {
        console.error('Error reading DJ Mix file:', error);
        throw error;
    }
}

/**
 * Displays help information for using the script.
 */
function showHelp() {
    console.log(`
Usage: video-timeline-export [options]

Options:
  -i, --input <file>    Input JSON file path
  -f, --format <format> Output format (currently only 'fcpxml' is supported)
  -o, --output <file>   Output file path
  -h, --help            Show this help message

Example:
  video-timeline-export -i ./input.json -f fcpxml -o ./output.fcpxml
  `);
}

/**
 * Parses command line arguments.
 * @param {string[]} args - The command line arguments to parse.
 * @returns {Object | null} An object containing the parsed arguments, or null if required arguments are missing.
 */
function parseArguments(args: string[]): { input: string; format: string; output: string } | null {
    let input = '';
    let format = '';
    let output = '';

    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '-i':
            case '--input':
                input = args[++i];
                break;
            case '-f':
            case '--format':
                format = args[++i];
                break;
            case '-o':
            case '--output':
                output = args[++i];
                break;
            case '-h':
            case '--help':
                showHelp();
                process.exit(0);
        }
    }

    if (!input || !format || !output) {
        return null;
    }

    return { input, format, output };
}

/**
 * The main function that orchestrates the DJ Mix to Final Cut Pro XML conversion process.
 */
async function main() {
    const args = parseArguments(process.argv.slice(2));

    if (!args) {
        showHelp();
        process.exit(1);
    }

    if (args.format !== 'fcpxml') {
        console.error('Error: Only Final Cut Pro XML format (fcpxml) is currently supported');
        process.exit(1);
    }

    try {
        const djMix = await readDjMixFile(args.input);
        await exportToFCPXML(djMix, args.output);
    } catch (error) {
        console.error('Error in DJ Mix to Final Cut Pro XML conversion:', error);
        process.exit(1);
    }
}

main();