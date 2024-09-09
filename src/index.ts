import { Builder } from 'xml2js';
import fs from 'fs/promises';

/**
 * Represents a single track in the DJ mix.
 */
export interface DJMixTrack {
    startTime: string;
    trackNumber: number;
    title: string;
    artist: string;
    bpm: number;
    beatNumber: number;
    position: string;
    videoPlaceholder: string;
    transition: {
        startTime: string;
        endTime: string;
        type: 'Crossfade' | 'Iris wipe' | 'Heart' | 'Glitch';
    };
}

/**
 * Represents the entire DJ mix, including the complete audio file and the list of tracks.
 */
export interface DJMix {
    djMix: {
        completeMixAudioFile: string;
        setTrackList: DJMixTrack[];
    };
}

/**
 * Converts a timecode string to frame number.
 * @param {string} timecode - The timecode in format "hh:mm:ss:mmm".
 * @returns {number} The frame number (assuming 30fps).
 */
function timecodeToFrame(timecode: string): number {
    const [hours, minutes, seconds, milliseconds] = timecode.split(':').map(Number);
    return Math.round((hours * 3600 + minutes * 60 + seconds + milliseconds / 1000) * 30);
}

/**
 * Maps transition types to Final Cut Pro XML transition names.
 * @param {string} transitionType - The transition type from the DJ mix data.
 * @returns {string} The corresponding FCP XML transition name.
 */
function mapTransitionType(transitionType: string): string {
    const transitionMap: { [key: string]: string } = {
        'Crossfade': 'Cross Dissolve',
        'Iris wipe': 'Circle Iris',
        'Heart': 'Heart Wipe',
        'Glitch': 'Cross Dissolve' // Fallback to Cross Dissolve for unsupported types
    };

    return transitionMap[transitionType] || 'Cross Dissolve';
}

/**
 * Exports a DJ Mix to a Final Cut Pro 7 XML file (version 5).
 * @param {DJMix} djMix - The DJ Mix data to export.
 * @param {string} outputFile - The path where the XML file should be saved.
 * @returns {Promise<void>} A promise that resolves when the XML file has been written.
 * @throws Will throw an error if the XML file cannot be created or written.
 */
export async function exportToFCPXML(djMix: DJMix, outputFile: string): Promise<void> {
    const { completeMixAudioFile, setTrackList } = djMix.djMix;

    const totalDuration = timecodeToFrame(setTrackList[setTrackList.length - 1].transition.endTime);

    const xmlObj = {
        'xmeml': {
            '$': { 'version': '5' },
            'sequence': [{
                'name': ['DJ Mix Sequence'],
                'duration': [totalDuration.toString()],
                'rate': [{ 'timebase': ['30'], 'ntsc': ['TRUE'] }],
                'in': ['-1'],
                'out': ['-1'],
                'timecode': [{
                    'string': ['01:00:00:00'],
                    'frame': ['108000'],
                    'displayformat': ['NDF'],
                    'rate': [{ 'timebase': ['30'], 'ntsc': ['TRUE'] }]
                }],
                'media': [{
                    'video': [{
                        'track': [{
                            'clipitem': setTrackList.map((track, index) => ({
                                '$': { 'id': `clip_${index}` },
                                'name': [track.title],
                                'duration': [timecodeToFrame(track.transition.endTime).toString()],
                                'rate': [{ 'timebase': ['30'], 'ntsc': ['TRUE'] }],
                                'start': [timecodeToFrame(track.startTime).toString()],
                                'end': [timecodeToFrame(track.transition.endTime).toString()],
                                'enabled': ['TRUE'],
                                'in': ['0'],
                                'out': [timecodeToFrame(track.transition.endTime).toString()],
                                'file': [{
                                    '$': { 'id': `file_${index}` },
                                    'name': [track.videoPlaceholder],
                                    'pathurl': [`file://${track.videoPlaceholder}`],
                                    'rate': [{ 'timebase': ['30'], 'ntsc': ['TRUE'] }],
                                    'duration': [timecodeToFrame(track.transition.endTime).toString()],
                                    'timecode': [{
                                        'string': ['00:00:00:00'],
                                        'displayformat': ['NDF'],
                                        'rate': [{ 'timebase': ['30'], 'ntsc': ['TRUE'] }]
                                    }],
                                    'media': [{
                                        'video': [{
                                            'samplecharacteristics': [{
                                                'width': ['1080'],
                                                'height': ['1080']
                                            }]
                                        }],
                                        'audio': [{ 'channelcount': ['2'] }]
                                    }]
                                }],
                                'compositemode': ['normal'],
                                'filter': [
                                    {
                                        'enabled': ['TRUE'],
                                        'start': ['0'],
                                        'end': [timecodeToFrame(track.transition.endTime).toString()],
                                        'effect': [{
                                            'name': ['Basic Motion'],
                                            'effectid': ['basic'],
                                            'effecttype': ['motion'],
                                            'mediatype': ['video'],
                                            'parameter': [
                                                {
                                                    'name': ['Scale'],
                                                    'value': ['100']
                                                },
                                                {
                                                    'name': ['Center'],
                                                    'value': [{ 'horiz': ['0'], 'vert': ['0'] }]
                                                },
                                                {
                                                    'name': ['Rotation'],
                                                    'value': ['0']
                                                }
                                            ]
                                        }]
                                    }
                                ]
                            })),
                            'transitionitem': setTrackList.slice(0, -1).map((track, index) => ({
                                'rate': [{ 'timebase': ['30'], 'ntsc': ['TRUE'] }],
                                'start': [timecodeToFrame(track.transition.startTime).toString()],
                                'end': [timecodeToFrame(track.transition.endTime).toString()],
                                'alignment': ['center'],
                                'effect': [{
                                    'name': [mapTransitionType(track.transition.type)],
                                    'effectid': [mapTransitionType(track.transition.type)],
                                    'effecttype': ['transition'],
                                    'mediatype': ['video'],
                                    'effectcategory': ['Dissolve']
                                }]
                            })),
                            'enabled': ['TRUE'],
                            'locked': ['FALSE']
                        }],
                        'format': [{
                            'samplecharacteristics': [{
                                'width': ['1080'],
                                'height': ['1080'],
                                'pixelaspectratio': ['square'],
                                'rate': [{ 'timebase': ['30'], 'ntsc': ['TRUE'] }]
                            }]
                        }]
                    }],
                    'audio': [{
                        'track': [{
                            'clipitem': [{
                                '$': { 'id': 'audio_mix' },
                                'name': ['Complete Mix'],
                                'duration': [totalDuration.toString()],
                                'rate': [{ 'timebase': ['30'], 'ntsc': ['TRUE'] }],
                                'start': ['0'],
                                'end': [totalDuration.toString()],
                                'enabled': ['TRUE'],
                                'in': ['0'],
                                'out': [totalDuration.toString()],
                                'file': [{
                                    '$': { 'id': 'audio_file' },
                                    'name': [completeMixAudioFile],
                                    'pathurl': [`file://${completeMixAudioFile}`],
                                    'rate': [{ 'timebase': ['30'], 'ntsc': ['TRUE'] }],
                                    'duration': [totalDuration.toString()],
                                    'media': [{
                                        'audio': [{
                                            'samplecharacteristics': [{
                                                'depth': ['16'],
                                                'samplerate': ['48000']
                                            }],
                                            'channelcount': ['2']
                                        }]
                                    }]
                                }],
                                'sourcetrack': [{
                                    'mediatype': ['audio'],
                                    'trackindex': ['1']
                                }],
                                'filter': [
                                    {
                                        'enabled': ['TRUE'],
                                        'start': ['0'],
                                        'end': [totalDuration.toString()],
                                        'effect': [{
                                            'name': ['Audio Levels'],
                                            'effectid': ['audiolevels'],
                                            'effecttype': ['audiolevels'],
                                            'mediatype': ['audio'],
                                            'parameter': [{
                                                'name': ['Level'],
                                                'value': ['1']
                                            }]
                                        }]
                                    }
                                ]
                            }],
                            'enabled': ['TRUE'],
                            'locked': ['FALSE']
                        }]
                    }]
                }]
            }]
        }
    };

    const builder = new Builder({
        xmldec: { version: '1.0', encoding: 'UTF-8' },
        doctype: { pubID: '', sysID: '' },
        renderOpts: { 'pretty': true, 'indent': '  ', 'newline': '\n' },
        cdata: false
    });

    const xml = builder.buildObject(xmlObj);

    await fs.writeFile(outputFile, xml);
}
