# video-timeline-exporter

A flexible tool for exporting video timelines to Final Cut Pro XML format.

## Features

- Convert DJ mix JSON data to Final Cut Pro XML format
- Command-line interface for easy integration into workflows
- Exportable library for use in other Node.js projects
- Comprehensive unit tests for reliability and maintainability

## Installation

### Global Installation (for CLI use)

```bash
npm install -g video-timeline-exporter
```

### Local Installation (for use as a library in your project)

```bash
npm install video-timeline-exporter
```

## Usage

### Command Line Interface

After installing globally, you can use the CLI as follows:

```bash
video-timeline-export -i <input-json-file> -f fcpxml -o <output-fcpxml-file>
```

Options:
- `-i, --input <file>`: Input JSON file path (required)
- `-f, --format <format>`: Output format (currently only 'fcpxml' is supported) (required)
- `-o, --output <file>`: Output file path (required)
- `-h, --help`: Show help information

Example:
```bash
video-timeline-export -i ./my-dj-mix.json -f fcpxml -o ./output.fcpxml
```

### As a Library

You can also use video-timeline-exporter as a library in your Node.js projects:

```javascript
const { exportToFCPXML } = require('video-timeline-exporter');

const myDjMix = {
  djMix: {
    completeMixAudioFile: '/path/to/complete/mix.wav',
    setTrackList: [
      // ... your DJ mix data here
    ]
  }
};

exportToFCPXML(myDjMix, './output.fcpxml')
  .then(() => console.log('Final Cut Pro XML file created successfully'))
  .catch(error => console.error('Error creating Final Cut Pro XML file:', error));
```

## Input JSON Format

The input JSON should follow this structure:

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

Note that `videoPlaceholder` is a property of each track, not part of the transition object.

## Sample Input

A sample DJ set JSON file is provided in the `sample` directory of this repository. You can use this file to test the CLI:

```bash
video-timeline-export -i ./sample/dj-set.json -f fcpxml -o ./output.fcpxml
```

This sample file demonstrates the expected structure of the input JSON. Feel free to modify it or create your own input files based on this structure.

## Documentation

For more detailed information about the project, please check the [documentation](./doc/README.md) in the `doc` directory. This includes:

- Detailed information about [input and output file formats](./doc/file-formats.md)
- Additional technical specifications

### Generating API Documentation

This project uses JSDoc to generate API documentation from the source code comments. To generate the documentation:

1. Make sure you have all dependencies installed:
   ```
   npm install
   ```

2. Run the documentation generation script:
   ```
   npm run docs
   ```

3. The generated documentation will be available in the `doc/api/` directory. Open `doc/api/index.html` in a web browser to view it.

Note: You'll need to have Node.js and npm installed on your system to run these commands.

## Development

To set up the project for development:

1. Clone the repository
2. Install dependencies: `npm install`
3. Build the project: `npm run build`
4. Run tests: `npm test`

### Running Tests

This project uses Jest for unit testing. To run the tests:

```bash
npm test
```

This will run all the unit tests in the `tests` directory. The tests cover both the core functionality in `index.ts` and the CLI operations in `cli.ts`.

### Development Usage

When developing or testing the CLI locally, you can use the following npm script:

```bash
npm run cli -- -i <input-file> -f fcpxml -o <output-file>
```

For example:

```bash
npm run cli -- -i ./sample/dj-mix.json -f fcpxml -o ./output.fcpxml
```

Note the `--` after `npm run cli`. This ensures that the arguments are passed to our CLI script and not to npm itself.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. When contributing:

1. Fork the repository
2. Create a new branch for your feature or bug fix
3. Write tests for your changes
4. Ensure all tests pass by running `npm test`
5. Submit a pull request with a clear description of your changes

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any problems or have any questions, please open an issue on the GitHub repository.
