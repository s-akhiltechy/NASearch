
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


// Run the function
loadNASAContent();