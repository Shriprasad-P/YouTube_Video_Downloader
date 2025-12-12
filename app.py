from flask import Flask, request, jsonify, send_file, Response
from flask_cors import CORS
import yt_dlp
import os
import tempfile

app = Flask(__name__, static_folder='static', static_url_path='')
CORS(app)

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/api/info', methods=['POST'])
def get_video_info():
    data = request.json
    url = data.get('url')
    
    if not url:
        return jsonify({'error': 'URL is required'}), 400

    try:
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            
            formats = []
            for f in info.get('formats', []):
                # Filter for video+audio or separate video streams that we can merge (simplified for now to just list available)
                # For high quality, we usually look for 'bestvideo+bestaudio' but for listing we want options.
                # Let's just return relevant data for the frontend to filter/display.
                
                # We want to show resolution, ext, and filesize if available
                if f.get('vcodec') != 'none': # It's a video
                    formats.append({
                        'format_id': f['format_id'],
                        'ext': f['ext'],
                        'resolution': f.get('resolution'),
                        'filesize': f.get('filesize'),
                        'note': f.get('format_note'),
                        'vcodec': f.get('vcodec'),
                        'acodec': f.get('acodec'),
                    })
            
            # Sort formats by resolution (simplified logic)
            # formats.sort(key=lambda x: x.get('filesize') or 0, reverse=True)

            video_data = {
                'title': info.get('title'),
                'thumbnail': info.get('thumbnail'),
                'duration': info.get('duration'),
                'formats': formats
            }
            
            return jsonify(video_data)
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/download', methods=['POST'])
def download_video():
    data = request.json
    url = data.get('url')
    format_id = data.get('format_id')
    
    if not url:
        return jsonify({'error': 'URL is required'}), 400

    try:
        # Create a temporary directory for the download
        temp_dir = tempfile.mkdtemp()
        
        # Use format that merges best video + best audio for the selected quality
        if format_id:
            # Merge selected video format with best available audio
            download_format = f'{format_id}+bestaudio/best'
        else:
            # Best quality with both video and audio
            download_format = 'bestvideo+bestaudio/best'
        
        ydl_opts = {
            'format': download_format,
            'outtmpl': os.path.join(temp_dir, '%(title)s.%(ext)s'),
            'quiet': True,
            # Merge video and audio into mp4 container
            'merge_output_format': 'mp4',
            'postprocessors': [{
                'key': 'FFmpegVideoConvertor',
                'preferedformat': 'mp4',
            }],
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            filename = ydl.prepare_filename(info)
            
            return send_file(filename, as_attachment=True, download_name=os.path.basename(filename))
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)
