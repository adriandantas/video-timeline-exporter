// tests/cli.test.ts

import { readDjMixFile, parseArguments, processDjMix, main } from '../src/cli';
import { exportToFCPXML } from '../src';
import fs from 'fs-extra';

jest.mock('fs-extra');
jest.mock('../src/index');

describe('readDjMixFile', () => {
    it('should read and parse a DJ Mix file', async () => {
        const mockDJMix = { djMix: { completeMixAudioFile: 'test.wav', setTrackList: [] } };
        (fs.readJSON as jest.Mock).mockResolvedValue(mockDJMix);

        const result = await readDjMixFile('input.json');
        expect(result).toEqual(mockDJMix);
        expect(fs.readJSON).toHaveBeenCalledWith('input.json');
    });

    it('should throw an error if file reading fails', async () => {
        (fs.readJSON as jest.Mock).mockRejectedValue(new Error('Read error'));

        await expect(readDjMixFile('input.json')).rejects.toThrow('Read error');
    });
});

describe('parseArguments', () => {
    it('should parse valid arguments', () => {
        const args = ['-i', 'input.json', '-f', 'fcpxml', '-o', 'output.xml'];
        const result = parseArguments(args);
        expect(result).toEqual({ input: 'input.json', format: 'fcpxml', output: 'output.xml' });
    });

    it('should return null for incomplete arguments', () => {
        const args = ['-i', 'input.json', '-f', 'fcpxml'];
        const result = parseArguments(args);
        expect(result).toBeNull();
    });

    it('should handle long-form arguments', () => {
        const args = ['--input', 'input.json', '--format', 'fcpxml', '--output', 'output.xml'];
        const result = parseArguments(args);
        expect(result).toEqual({ input: 'input.json', format: 'fcpxml', output: 'output.xml' });
    });

    it('should return null when help is requested', () => {
        const args = ['-h'];
        const result = parseArguments(args);
        expect(result).toBeNull();
    });
});

describe('processDjMix', () => {
    it('should process a DJ mix successfully', async () => {
        const mockDJMix = { djMix: { completeMixAudioFile: 'test.wav', setTrackList: [] } };
        (fs.readJSON as jest.Mock).mockResolvedValue(mockDJMix);
        (exportToFCPXML as jest.Mock).mockResolvedValue(undefined);

        const args = { input: 'input.json', format: 'fcpxml', output: 'output.xml' };
        await expect(processDjMix(args)).resolves.not.toThrow();

        expect(fs.readJSON).toHaveBeenCalledWith('input.json');
        expect(exportToFCPXML).toHaveBeenCalledWith(mockDJMix, 'output.xml');
    });

    it('should throw an error for unsupported formats', async () => {
        const args = { input: 'input.json', format: 'unsupported', output: 'output.xml' };
        await expect(processDjMix(args)).rejects.toThrow('Only Final Cut Pro XML format (fcpxml) is currently supported');
    });
});

describe('main', () => {
    const mockExit = jest.spyOn(process, 'exit').mockImplementation((number) => { throw new Error('process.exit: ' + number); });
    const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
    const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should process valid arguments', async () => {
        const args = ['-i', 'input.json', '-f', 'fcpxml', '-o', 'output.xml'];
        await expect(main(args)).resolves.not.toThrow();
        expect(mockExit).not.toHaveBeenCalled();
        expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('created successfully'));
    });

    it('should show help and exit for invalid arguments', async () => {
        const args = ['-i', 'input.json'];
        await expect(main(args)).rejects.toThrow('process.exit: 1');
        expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Usage:'));
    });

    it('should handle processing errors', async () => {
        const args = ['-i', 'input.json', '-f', 'unsupported', '-o', 'output.xml'];
        await expect(main(args)).rejects.toThrow('process.exit: 1');
        expect(mockConsoleError).toHaveBeenCalledWith(
            'Error in DJ Mix to Final Cut Pro XML conversion:',
            expect.any(Error)
        );
        expect(mockConsoleError.mock.calls[0][1].message).toBe('Error: Only Final Cut Pro XML format (fcpxml) is currently supported');
    });
});