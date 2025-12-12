document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('urlInput');
    const fetchBtn = document.getElementById('fetchBtn');
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const errorMsg = document.getElementById('errorMsg');
    const result = document.getElementById('result');
    const thumbnail = document.getElementById('thumbnail');
    const videoTitle = document.getElementById('videoTitle');
    const videoDuration = document.getElementById('videoDuration').querySelector('span');
    const formatsList = document.getElementById('formatsList');

    fetchBtn.addEventListener('click', fetchVideoInfo);
    urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') fetchVideoInfo();
    });

    async function fetchVideoInfo() {
        const url = urlInput.value.trim();
        if (!url) return;

        // Reset UI
        loading.classList.remove('hidden');
        error.classList.add('hidden');
        result.classList.add('hidden');
        formatsList.innerHTML = '';

        try {
            const response = await fetch('/api/info', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch video info');
            }

            displayVideoInfo(data);
        } catch (err) {
            showError(err.message);
        } finally {
            loading.classList.add('hidden');
        }
    }

    function displayVideoInfo(data) {
        thumbnail.src = data.thumbnail;
        videoTitle.textContent = data.title;
        videoDuration.textContent = formatDuration(data.duration);

        // Filter and sort formats
        // We want to show unique resolutions, prioritizing mp4
        const uniqueFormats = new Map();
        
        data.formats.forEach(format => {
            // Basic filtering for useful formats
            if (format.resolution && format.resolution !== 'audio only') {
                const height = parseInt(format.resolution.split('x')[1]) || 0;
                if (height >= 360) { // Only show 360p+
                    const key = `${height}p`;
                    // Keep if it's the first one or if it's mp4 (preferred)
                    if (!uniqueFormats.has(key) || (format.ext === 'mp4' && uniqueFormats.get(key).ext !== 'mp4')) {
                        uniqueFormats.set(key, {
                            ...format,
                            label: key
                        });
                    }
                }
            }
        });

        // Convert map to array and sort by resolution (descending)
        const sortedFormats = Array.from(uniqueFormats.values()).sort((a, b) => {
            const hA = parseInt(a.label);
            const hB = parseInt(b.label);
            return hB - hA;
        });

        if (sortedFormats.length === 0) {
            showError("No suitable video formats found.");
            return;
        }

        sortedFormats.forEach(format => {
            const btn = document.createElement('div');
            btn.className = 'format-btn';
            btn.innerHTML = `
                <span class="format-res">${format.label}</span>
                <span class="format-meta">${format.ext.toUpperCase()}</span>
            `;
            btn.onclick = () => downloadVideo(urlInput.value, format.format_id, format.label);
            formatsList.appendChild(btn);
        });

        result.classList.remove('hidden');
    }

    async function downloadVideo(url, formatId, label) {
        const btn = event.currentTarget;
        const originalText = btn.innerHTML;
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i>`;
        btn.style.pointerEvents = 'none';

        try {
            const response = await fetch('/api/download', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, format_id: formatId })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Download failed');
            }

            // Trigger download
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `${videoTitle.textContent}_${label}.${blob.type.split('/')[1] || 'mp4'}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(downloadUrl);
            a.remove();

        } catch (err) {
            showError(err.message);
        } finally {
            btn.innerHTML = originalText;
            btn.style.pointerEvents = 'auto';
        }
    }

    function showError(msg) {
        errorMsg.textContent = msg;
        error.classList.remove('hidden');
    }

    function formatDuration(seconds) {
        if (!seconds) return 'Unknown';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        
        if (h > 0) {
            return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
        return `${m}:${s.toString().padStart(2, '0')}`;
    }
});
