# Video Timeline Exporter

This document describes the file formats and functionality of the video-timeline-exporter.

## Overview

The video-timeline-exporter is a tool that converts a DJ mix timeline into a Final Cut Pro 7 XML format (version 5). It takes a JSON input describing the DJ mix and outputs an XML file that can be imported into Final Cut Pro or similar video editing software.

## Input JSON Format

The input to video-timeline-exporter should be a JSON file with the following structure:

```json
{
  "djMix": {
    "completeMixAudioFile": "/path/to/complete/mix.wav",
    "setTrackList": [
      {
        "startTime": "00:00:00:000",
        "trackNumber": 1,
        "title": "Track Title",
        "artist": "Artist Name",
        "bpm": 120,
        "beatNumber": 1,
        "position": "00:00:00:000",
        "videoPlaceholder": "/path/to/video/clip.mp4",
        "transition": {
          "startTime": "00:05:30:000",
          "endTime": "00:05:45:000",
          "type": "Crossfade"
        }
      },
      // ... more tracks
    ]
  }
}
```

### Field Descriptions

- `completeMixAudioFile`: Path to the audio file of the complete DJ mix.
- `setTrackList`: An array of tracks in the mix.
    - `startTime`: The start time of the track in the format "hh:mm:ss:mmm".
    - `trackNumber`: The track number in the playlist.
    - `title`: The title of the track.
    - `artist`: The artist of the track.
    - `bpm`: The tempo of the track in beats per minute.
    - `beatNumber`: The cumulative beat number at the start of this track in the mix.
    - `position`: The position of the track in the set, in the format "hh:mm:ss:mmm".
    - `videoPlaceholder`: The file path to the video clip associated with this track.
    - `transition`: Information about the transition from this track to the next.
        - `startTime`: The start time of the transition in the format "hh:mm:ss:mmm".
        - `endTime`: The end time of the transition in the format "hh:mm:ss:mmm".
        - `type`: The type of transition effect ("Crossfade", "Iris wipe", "Heart", or "Glitch").

## Output Final Cut Pro XML Format

The output is a Final Cut Pro 7 XML file (version 5). This XML format describes the video editing project and can be imported into Final Cut Pro and some other video editing software.

The generated XML file contains:

1. A single audio track with the complete mix audio.
2. A video track with clips corresponding to each track in the input JSON.
3. Transition effects between video clips.

Key features of the output XML:

- Video resolution is set to 1080x1080 pixels.
- Frame rate is set to 30fps (NTSC).
- Each video clip has a "Basic Motion" filter applied.
- Transitions between clips are mapped to Final Cut Pro transition types.
- The audio track contains the complete mix as a single clip.

## Usage

To use the video-timeline-exporter, call the `exportToFCPXML` function with the DJ mix data and the desired output file path:

```typescript
import { exportToFCPXML, DJMix } from './path-to-module';

const djMixData: DJMix = {
  // Your DJ mix data here
};

exportToFCPXML(djMixData, '/path/to/output.xml')
  .then(() => console.log('Export completed successfully'))
  .catch(error => console.error('Export failed:', error));
```

## Limitations

- Complex transition effects may not be fully represented in the Final Cut Pro XML format.
- The exporter assumes a frame rate of 30fps for all timecode conversions.
- Video clips are assumed to have a resolution of 1080x1080 pixels.

Always test the output XML with your intended editing application to ensure compatibility and correct representation of your DJ mix timeline.
