import { exportToFCPXML, DJMix } from '../src/index';
import fs from 'fs/promises';
import { Builder } from 'xml2js';

jest.mock('fs/promises');
jest.mock('xml2js');

describe('exportToFCPXML', () => {
    const mockDJMix: DJMix = {
        djMix: {
            completeMixAudioFile: '/path/to/mix.wav',
            setTrackList: [
                {
                    startTime: '00:00:00:000',
                    trackNumber: 1,
                    title: 'Track 1',
                    artist: 'Artist 1',
                    bpm: 120,
                    beatNumber: 1,
                    position: '00:00:00:000',
                    videoPlaceholder: '/path/to/video1.mp4',
                    transition: {
                        startTime: '00:05:00:000',
                        endTime: '00:05:15:000',
                        type: 'Crossfade',
                    },
                },
                {
                    startTime: '00:05:15:000',
                    trackNumber: 2,
                    title: 'Track 2',
                    artist: 'Artist 2',
                    bpm: 125,
                    beatNumber: 601,
                    position: '00:05:15:000',
                    videoPlaceholder: '/path/to/video2.mp4',
                    transition: {
                        startTime: '00:10:15:000',
                        endTime: '00:10:30:000',
                        type: 'Iris wipe',
                    },
                },
            ],
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create an FCPXML file', async () => {
        const mockXml = '<xml>Mock XML</xml>';
        (Builder.prototype.buildObject as jest.Mock).mockReturnValue(mockXml);

        await exportToFCPXML(mockDJMix, 'output.xml');

        expect(fs.writeFile).toHaveBeenCalledWith('output.xml', mockXml);
        expect(Builder).toHaveBeenCalled();
        expect(Builder.prototype.buildObject).toHaveBeenCalled();
    });

    it('should throw an error if file writing fails', async () => {
        (fs.writeFile as jest.Mock).mockRejectedValue(new Error('Write error'));

        await expect(exportToFCPXML(mockDJMix, 'output.xml')).rejects.toThrow('Write error');
    });
});