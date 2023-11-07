import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
const app = express();
const port = 3000;
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));
//define wmo codes
const wmo = {
  0: "Clear Sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Intense drizzel",
  56: "Light freezing drizzle",
  57: "Heavy freezing drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  66: "Light Freezing rain",
  67: "Heavy Freezing rain",
  71: "Slight Snowfall",
  73: "Moderate snowfall",
  75: "Heavy snowfall",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Heavy rain showers",
  85: "Slight Snow showers",
  86: "Heavy Snow showers",
  95: "Thunderstorm: Slight or moderate",
  96: "Thunderstorm: Slight hail",
  99: "Thunderstorm: Moderate hail",
};

const rainCheck = [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82];

var imgChoice = { liveImg: "clearSky" };

//Initial Time check for image

var today = new Date();
var time = today.getHours();
if (time > 8 && time < 18) {
  imgChoice = { liveImg: "clearSky" };
} else {
  imgChoice = { liveImg: "nightSky" };
}

app.get("/", async (req, res) => {
  res.render("index.ejs", imgChoice);
});

app.post("/checkweather", async (req, res) => {
  //Get Latitude and longitud from geocoding-api
  const cityName = req.body.city;
  console.log(cityName);
  const coordResponse = await axios.get(
    `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1&language=en&format=json`
  );
  //Checks if result is undefined
  const resultCoord = coordResponse.data;
  if (resultCoord.results === undefined) {
    res.render("index.ejs", imgChoice);
  } else {
    const latitud = resultCoord.results[0].latitude;
    const longitud = resultCoord.results[0].longitude;
    const cityLabel =
      resultCoord.results[0].name + ", " + resultCoord.results[0].country_code;

    //calls the weather API
    try {
      const response = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitud}&longitude=${longitud}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,surface_pressure,wind_speed_10m&forecast_days=1`
      );
      const result = response.data;
      const wmoDesc = wmo[result.current.weather_code];
      // modify image according to wmo
      if (rainCheck.includes(result.current.weather_code)) {
        imgChoice = { liveImg: "rain" };
      }

      //Sends the data back to the .ejs
      res.render("index.ejs", { cityLabel, result, wmoDesc, imgChoice });
      //console.log(result);
      // res.render("index.ejs", { secret: result.secret, user: result.username });
    } catch (error) {
      console.log(error);
      res.status(500);
    }
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
