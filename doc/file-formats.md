# File Formats

This document describes the file formats used by video-timeline-exporter.

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
        - `type`: The type of transition effect (e.g., "Crossfade", "Iris wipe", "Heart", "Glitch").

## Output Final Cut Pro XML Format

The output of video-timeline-exporter is a Final Cut Pro XML file. This XML format is used to describe video editing projects and can be imported into Final Cut Pro and some other video editing software.

The generated XML file will contain:

1. A single audio track with the complete mix audio.
2. A video track with clips corresponding to each track in the input JSON.
3. Basic information about transitions between video clips (note that complex transition effects may not be fully represented).

The XML structure follows this general format:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE xmeml>
<xmeml version="5">
  <sequence>
    <name>DJ Mix</name>
    <duration>...</duration>
    <rate>
      <ntsc>TRUE</ntsc>
      <timebase>30</timebase>
    </rate>
    <media>
      <audio>
        <track>
          <clipitem>
            <name>Complete Mix</name>
            <duration>...</duration>
            <start>0</start>
            <end>...</end>
            <file>
              <name>...</name>
              <pathurl>...</pathurl>
            </file>
          </clipitem>
        </track>
      </audio>
      <video>
        <track>
          <clipitem>
            <name>Track 1</name>
            <duration>...</duration>
            <start>...</start>
            <end>...</end>
            <file>
              <name>...</name>
              <pathurl>...</pathurl>
            </file>
          </clipitem>
          <!-- More clipitems for each track -->
        </track>
      </video>
    </media>
  </sequence>
</xmeml>
```

Note: The exact structure of the Final Cut Pro XML file may vary depending on the specific requirements of your video editing workflow. Always test the output with your intended editing application to ensure compatibility.