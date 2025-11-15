const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const { exec } = require("child_process");

const app = express();
app.use(bodyParser.json({ limit: "200mb" }));

app.post("/render", async (req, res) => {
    const { imageBase64, audioBase64 } = req.body;

    if (!imageBase64 || !audioBase64) {
        return res.status(400).send("Missing imageBase64 or audioBase64");
    }

    fs.writeFileSync("img.png", Buffer.from(imageBase64, "base64"));
    fs.writeFileSync("audio.mp3", Buffer.from(audioBase64, "base64"));

    const cmd = `ffmpeg -loop 1 -i img.png -i audio.mp3 -c:v libx264 -tune stillimage -c:a aac -b:a 192k -pix_fmt yuv420p -shortest output.mp4 -y`;

    exec(cmd, (err) => {
        if (err) {
            return res.status(500).send(err.message);
        }

        const video = fs.readFileSync("output.mp4").toString("base64");
        res.json({ videoBase64: video });
    });
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Server running");
});
