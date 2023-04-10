const { Configuration, OpenAIApi } = require("openai");
const { YoutubeTranscript } = require("youtube-transcript");
const app = require("express")();
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cors = require("cors");

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(bodyParser.json());
dotenv.config();
const port = process.env.PORT;

const getTranscript = async (videoId) => {
  let transcript = "";
  const fetchtranscript = await YoutubeTranscript.fetchTranscript(videoId);
  for (let i = 0; i < fetchtranscript.length; i++) {
    transcript += fetchtranscript[i].text + " ";
    if (transcript.length > 4000) {
      break;
    }
  }
  return transcript;
};

const config = new Configuration({
  organization: process.env.ORGANIZATION_ID,
  apiKey: process.env.API_KEY,
});

const openai = new OpenAIApi(config);

//make a request to the openai api with the transcript as the prompt

app.post("/explain", async (req, res) => {
  const { message } = req.body;
  console.log(message);
  const transcript = await getTranscript(message);
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `Explain this video in depth with transcript : ${transcript}`,
    max_tokens: 3096,
    temperature: 0.2,
  });
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.json({
    message: response.data.choices[0].text,
  });
  console.log(response.data.choices[0].text);
});

app.get("/", (req, res) => {
  res.send("Youtube Summarizer");
});

app.post("/summarize", async (req, res) => {
  const { message } = req.body;
  console.log(message);
  const transcript = await getTranscript(message);
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `Summarize the video with given transcript: ${transcript}`,
    max_tokens: 3096,
    temperature: 0.2,
  });
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.json({
    message: response.data.choices[0].text,
  });
  console.log(response.data.choices[0].text);
});

app.listen(port, () => {
  console.log(` App listening at http://localhost:${port}`);
});
