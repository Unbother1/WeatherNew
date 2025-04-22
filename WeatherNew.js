let latestWeatherData = null; // Stores weather data globally

async function getWeather() {
  const city = document.getElementById("cityInput").value;
  const apiKey = "f8b3dea5b6f8b60d46a38eb5eb884ec8";
  const resultBox = document.getElementById("weatherResult");

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );

    if (!response.ok) throw new Error("City not found");

    const data = await response.json();
    latestWeatherData = data; // Save it for summary later

    resultBox.innerHTML = `
      <h3><i class="fas fa-map-marker-alt"></i> ${data.name}, ${data.sys.country}</h3>
      <p><i class="fas fa-thermometer-half"></i> Temp: ${data.main.temp}°C</p>
      <p><i class="fas fa-tint"></i> Humidity: ${data.main.humidity}%</p>
      <p><i class="fas fa-wind"></i> Wind: ${data.wind.speed} m/s</p>
      <p><i class="fas fa-cloud"></i> Weather: ${data.weather[0].main}</p>
      <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="weather icon"/>
    `;

    // Show the "Show Summary" button
    document.getElementById("showSummaryBtn").style.display = "inline-block";

    // Hide previous summary (if any)
    document.getElementById("summaryBox").style.display = "none";

  } catch (error) {
    resultBox.innerHTML = `<p style="color: red;"><i class="fas fa-exclamation-circle"></i> ${error.message}</p>`;
    document.getElementById("showSummaryBtn").style.display = "none";
    document.getElementById("summaryBox").style.display = "none";
  }
}

// This function runs when user clicks "Show Summary"
function showSummary() {
  if (!latestWeatherData) return;

  const location = `${latestWeatherData.name}, ${latestWeatherData.sys.country}`;
  const temp = latestWeatherData.main.temp;
  const humidity = latestWeatherData.main.humidity;
  const wind = latestWeatherData.wind.speed;
  const condition = latestWeatherData.weather[0].main;

  const summary = generateWeatherSummary(location, temp, humidity, wind, condition);
  document.getElementById("summaryText").textContent = summary;
  document.getElementById("summaryBox").style.display = "block";
}

// Summary generator
function generateWeatherSummary(location, temp, humidity, wind, condition) {
  let summary = `It's a`;

  if (temp >= 30) summary += ` hot`;
  else if (temp <= 20) summary += ` cool`;
  else summary += ` mild`;

  summary += ` and ${humidity >= 70 ? 'humid' : 'comfortable'} day in ${location}. `;

  if (condition.toLowerCase() === "rain") {
    summary += `Rain is falling—stay dry! `;
  } else {
    summary += `Expect ${condition.toLowerCase()} skies. `;
  }

  summary += `Winds are blowing at ${wind} m/s.`;

  return summary;
}
