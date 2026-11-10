const NASA_API_KEY = "A2XnBglnr5vNA9OgdaFg9y3lbl3h0JCocEuvRg0k";

async function loadNASAImage() {

    try {

        const response = await fetch(
            `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`
        );

        const data = await response.json();

        console.log(data);

        if (data.media_type === "image") {

            document.body.style.backgroundImage =
                `url("${data.url}")`;

        }

    } catch (error) {

        console.log("NASA image failed:", error);

    }
}

loadNASAImage();
