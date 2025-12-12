# YouTube Video Downloader

A web application to download YouTube videos with high resolution and audio support.

![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)
![Flask](https://img.shields.io/badge/Flask-3.0-green.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

## Features

- 🎬 Download YouTube videos in multiple resolutions
- 🎵 Automatic video + audio merging for best quality
- 📱 Modern, responsive web interface
- ⚡ Fast downloads using yt-dlp
- 🔍 Video preview with thumbnail and duration

## Prerequisites

- Python 3.8+
- [ffmpeg](https://ffmpeg.org/) (required for merging video and audio)

### Install ffmpeg

```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt install ffmpeg

# Windows
# Download from https://ffmpeg.org/download.html
```

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Shriprasad-P/YouTube_Video_Downloader.git
   cd YouTube_Video_Downloader
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

## Usage

1. **Start the server**
   ```bash
   python app.py
   ```

2. **Open your browser** and navigate to:
   ```
   http://127.0.0.1:5001
   ```

3. **Paste a YouTube URL** and select your preferred format to download!

## Tech Stack

- **Backend**: Flask, yt-dlp
- **Frontend**: HTML, CSS, JavaScript
- **Media Processing**: ffmpeg

## Project Structure

```
YouTube_Video_Downloader/
├── app.py              # Flask backend server
├── requirements.txt    # Python dependencies
├── static/
│   ├── index.html      # Main HTML page
│   ├── style.css       # Styles
│   └── script.js       # Frontend logic
└── README.md
```

## License

MIT License - feel free to use this project for personal or educational purposes.

## Author

**Shriprasad P**

- GitHub: [@Shriprasad-P](https://github.com/Shriprasad-P)
