async function loadNASAContent() {

    const container = document.getElementById("bg-media");

    try {

        console.log("Loading NASA daily content...");

        // Fetch NASA APOD data
        const response = await fetch(
            "https://science.nasa.gov/wp-json/wp/v2/apod-basic/"
        );

        if (!response.ok) {
            throw new Error(`NASA API Error: ${response.status}`);
        }

        const result = await response.json();

        // API may return an array or a single object
        const entries = Array.isArray(result)
            ? result
            : [result];

        // Find the latest available entry
        const validEntries = entries
            .filter(item => item.date)
            .sort((a, b) =>
                new Date(b.date) - new Date(a.date)
            );

        const data = validEntries[0];

        if (!data) {
            throw new Error("No NASA content found.");
        }

        console.log("NASA Content:", data);
        console.log("Title:", data.title);
        console.log("Media Type:", data.media_type);

        // Clear previous background
        container.innerHTML = "";

        // Parse NASA's supplied HTML for media
        const parser = new DOMParser();
        const doc = parser.parseFromString(
            data.basic_html || "",
            "text/html"
        );

        // VIDEO BACKGROUND
        if (data.media_type === "video") {

            const videoElement = doc.querySelector("video");
            const videoSource = videoElement?.querySelector("source");
            const directVideoURL =
                videoElement?.src || videoSource?.src;

            const iframe = doc.querySelector("iframe");

            if (directVideoURL) {

                const video = document.createElement("video");

                video.src = directVideoURL;
                video.autoplay = true;
                video.muted = true;
                video.loop = true;
                video.playsInline = true;
                video.preload = "auto";

                container.appendChild(video);

                video.play().catch(error => {
                    console.warn("Video autoplay blocked:", error);
                });

                console.log("NASA video loaded!");

            } else if (iframe?.src) {

                const videoFrame = document.createElement("iframe");

                const videoURL = new URL(iframe.src);

                // Enable autoplay for supported providers
                if (videoURL.hostname.includes("youtube.com")) {

                    const videoID = videoURL.pathname.split("/").pop();

                    videoURL.searchParams.set("autoplay", "1");
                    videoURL.searchParams.set("mute", "1");
                    videoURL.searchParams.set("controls", "0");
                    videoURL.searchParams.set("loop", "1");
                    videoURL.searchParams.set("playlist", videoID);
                    videoURL.searchParams.set("playsinline", "1");

                } else if (videoURL.hostname.includes("vimeo.com")) {

                    videoURL.searchParams.set("autoplay", "1");
                    videoURL.searchParams.set("muted", "1");
                    videoURL.searchParams.set("loop", "1");
                    videoURL.searchParams.set("background", "1");

                }

                videoFrame.src = videoURL.toString();
                videoFrame.allow = "autoplay; fullscreen; picture-in-picture";
                videoFrame.allowFullscreen = true;

                container.appendChild(videoFrame);

                console.log("NASA embedded video loaded!");

            } else {

                console.warn(
                    "No playable video found. Showing available image instead."
                );

                showNASAImage(data, doc, container);
            }

        }

        // IMAGE BACKGROUND
        else if (data.media_type === "image") {

            showNASAImage(data, doc, container);

        }

        else {

            console.warn("Unsupported NASA media type:", data.media_type);

        }

    } catch (error) {

        console.error("NASA content failed:", error);

    }
}


// Display NASA image
function showNASAImage(data, doc, container) {

    const imageURL =
        data.hdurl ||
        doc.querySelector("img")?.src;

    if (!imageURL) {
        throw new Error("NASA image URL not found.");
    }

    const image = new Image();

    image.onload = () => {

        container.innerHTML = "";
        container.appendChild(image);

        console.log("NASA image loaded successfully!");

    };

    image.onerror = () => {
        console.error("NASA image could not be loaded.");
    };

    image.src = imageURL;

}

loadNASAContent();

// ============================
// 3. USEFUL APPS
// ============================

const apps = [

    {
        name: "Google",
        logo: "https://cdn-icons-png.flaticon.com/128/281/281764.png",
        url: "https://www.google.com"
    },

    {
        name: "YouTube",
        logo: "https://cdn-icons-png.flaticon.com/128/1384/1384060.png",
        url: "https://www.youtube.com"
    },

    {
        name: "GitHub",
        logo: "https://cdn-icons-png.flaticon.com/128/2111/2111432.png",
        url: "https://github.com"
    },

    {
        name: "Canva",
        logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDwn0ZVEmfrvQ855ti0L2JFL8fKHbMBnq9HZXlUTznskofUz68WZ8OjF4e&s=10",
        url: "https://www.canva.com"
    },

    {
        name: "ChatGPT",
        logo: "https://cdn-icons-png.flaticon.com/128/11865/11865326.png",
        url: "https://chatgpt.com"
    },

    {
        name: "Spotify",
        logo: "https://cdn-icons-png.flaticon.com/128/3669/3669986.png",
        url: "https://open.spotify.com"
    }

];


function loadApps() {

    const container = document.getElementById("apps-container");

    container.innerHTML = "";

    apps.forEach(app => {

        container.innerHTML += `
            <a href="${app.url}"
               target="_blank"
               class="app-card">

                <img
                    src="${app.logo}"
                    alt="${app.name} logo"
                    class="app-logo"
                >

                <h3>${app.name}</h3>

            </a>
        `;

    });
}

loadApps();




const LASTFM_API_KEY = "c4dce15f1a7c30abd78cb7de34f5156b";

async function loadMusic() {

    const container = document.getElementById("music-container");

    try {

        const response = await fetch(
            `https://ws.audioscrobbler.com/2.0/?method=chart.gettoptracks&api_key=${LASTFM_API_KEY}&format=json&limit=6`
        );

        const data = await response.json();

        if (data.error) {
            throw new Error(data.message);
        }

        container.innerHTML = "";

        for (let index = 0; index < data.tracks.track.length; index++) {

            const song = data.tracks.track[index];

            // Search iTunes for album artwork
            const searchQuery = encodeURIComponent(
                `${song.name} ${song.artist.name}`
            );

            const artworkResponse = await fetch(
                `https://itunes.apple.com/search?term=${searchQuery}&entity=song&limit=1`
            );

            const artworkData = await artworkResponse.json();

            let image = "";

            if (artworkData.results.length > 0) {

                image = artworkData.results[0].artworkUrl100
                    .replace("100x100", "300x300");

            }

            container.innerHTML += `

                <div class="music-card">

                    <img
                        src="${image}"
                        alt="${song.name}"
                        class="album-cover"
                    >

                    <div class="music-info">

                        <h3>${song.name}</h3>

                        <p>${song.artist.name}</p>

                        <small>
                            ${Number(song.listeners).toLocaleString()}
                            listeners
                        </small>

                    </div>

                    <a
                        href="${song.url}"
                        target="_blank"
                        class="listen-btn"
                    >
                        Listen
                    </a>

                </div>

            `;
        }

    } catch (error) {

        console.error("Music error:", error);

        container.innerHTML =
            "<p>Unable to load music.</p>";
    }
}

loadMusic();