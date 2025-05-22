let latestWeatherData = null;
let useCelsius = true;

const conditionIcon = {
  Clear: "🌞",
  Rain: "☔️",
  Clouds: "☁️",
  Snow: "❄️",
  Thunderstorm: "⛈️",
  Drizzle: "🌧️",
  Mist: "🌫️",
  Smoke: "🌫️",
  Haze: "🌫️",
  Dust: "🌬️",
  Fog: "🌫️",
  Sand: "🌬️",
  Ash: "🌋",
  Squall: "🌬️",
  Tornado: "🌪️",
};

async function getWeather() {
  const city = document.getElementById("cityInput").value.trim();
  const apiKey = "f8b3dea5b6f8b60d46a38eb5eb884ec8";
  const resultBox = document.getElementById("weatherResult");
  const forecastContainer = document.getElementById("forecastContainer");
  const summaryBox = document.getElementById("summaryBox");

  if (!city) {
    resultBox.innerHTML = `<p style="color: red;">Please enter a city name!</p>`;
    return;
  }

  resultBox.innerHTML = `<p>Fetching weather... ⏳</p>`;
  document.getElementById("historyContainer").style.display = "none";
  document.querySelector(".result-summary").style.display = "flex";
  forecastContainer.style.display = "none";
  summaryBox.style.display = "none";

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );
    if (!response.ok) throw new Error("City not found");

    const data = await response.json();
    latestWeatherData = data;

    const emoji = conditionIcon[data.weather[0].main] || "🌈";
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const tempC = data.main.temp;
    const tempF = ((tempC * 9) / 5 + 32).toFixed(1);

    resultBox.innerHTML = `
      <div class="weather-card-output">
        <h3>${emoji} ${data.name}, ${data.sys.country}</h3>
        <p class="datetime">🗓️ ${date} — ${time}</p>
        <p><strong>Temp:</strong> <span id="tempValue">${
          useCelsius ? tempC + "°C" : tempF + "°F"
        }</span></p>
        <p><strong>Humidity:</strong> ${data.main.humidity}%</p>
        <p><strong>Wind:</strong> ${data.wind.speed} m/s</p>
        <p><strong>Condition:</strong> ${data.weather[0].main}</p>
        <img class="animated-icon" src="https://openweathermap.org/img/wn/${
          data.weather[0].icon
        }@2x.png" alt="weather icon"/>
      </div>
    `;

    document.getElementById("showSummaryBtn").style.display = "inline-block";
    saveSearchHistory(city);

    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
    );
    const forecastData = await forecastRes.json();
    displayForecast(forecastData);
    forecastContainer.style.display = "grid";
  } catch (error) {
    resultBox.innerHTML = `<p style="color: red;">${error.message}</p>`;
    document.getElementById("showSummaryBtn").style.display = "none";
    summaryBox.style.display = "none";
  }
}

function displayForecast(forecastData) {
  const container = document.getElementById("forecastContainer");
  container.innerHTML = "<h3 style='text-align:center;'>5-Day Forecast</h3>";

  const daily = forecastData.list.filter((item) =>
    item.dt_txt.includes("12:00:00")
  );

  daily.forEach((day) => {
    const date = new Date(day.dt_txt);
    const shortDate = date.toLocaleDateString(undefined, {
      weekday: "short",
      day: "numeric",
    });
    const icon = day.weather[0].icon;
    const tempC = day.main.temp;
    const tempF = ((tempC * 9) / 5 + 32).toFixed(1);
    const condition = day.weather[0].main;

    container.innerHTML += `
      <div class="forecast-card">
        <p><strong>${shortDate}</strong></p>
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${condition}" class="animated-icon"/>
        <p>${useCelsius ? tempC + "°C" : tempF + "°F"}</p>
        <small>${condition}</small>
      </div>
    `;
  });
}

function toggleUnits() {
  useCelsius = !useCelsius;
  if (latestWeatherData) getWeather();
}

function showSummary() {
  if (!latestWeatherData) return;

  const loc = `${latestWeatherData.name}, ${latestWeatherData.sys.country}`;
  const temp = latestWeatherData.main.temp;
  const humidity = latestWeatherData.main.humidity;
  const wind = latestWeatherData.wind.speed;
  const condition = latestWeatherData.weather[0].main;

  const summary = generateWeatherSummary(loc, temp, humidity, wind, condition);
  document.getElementById("summaryText").textContent = summary;
  document.getElementById("summaryBox").style.display = "block";

  const utterance = new SpeechSynthesisUtterance(summary);
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}

function generateWeatherSummary(location, temp, humidity, wind, condition) {
  let summary = `It's a`;
  if (temp >= 30) summary += ` hot`;
  else if (temp <= 20) summary += ` cool`;
  else summary += ` mild`;

  summary += ` and ${
    humidity >= 70 ? "humid" : "comfortable"
  } day in ${location}. `;

  if (condition.toLowerCase() === "rain") {
    summary += `Rain is falling—stay dry! `;
  } else {
    summary += `Expect ${condition.toLowerCase()} skies. `;
  }

  summary += `Winds are blowing at ${wind} m/s.`;
  return summary;
}

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  localStorage.setItem("darkMode", isDark);
  document.getElementById("darkModeToggle").textContent = isDark
    ? "☀️ Light Mode"
    : "🌙 Dark Mode";
}

function toggleHistory() {
  const box = document.getElementById("historyContainer");
  box.style.display = box.style.display === "none" ? "flex" : "none";
}

function saveSearchHistory(city) {
  let history = JSON.parse(localStorage.getItem("weatherHistory")) || [];
  if (!history.includes(city)) {
    history.unshift(city);
    history = history.slice(0, 5);
    localStorage.setItem("weatherHistory", JSON.stringify(history));
    displaySearchHistory();
  }
}

function displaySearchHistory() {
  const container = document.getElementById("historyContainer");
  const history = JSON.parse(localStorage.getItem("weatherHistory")) || [];
  container.innerHTML = "";

  history.forEach((city) => {
    const btn = document.createElement("button");
    btn.textContent = city;
    btn.className = "history-btn";
    btn.onclick = () => {
      document.getElementById("cityInput").value = city;
      getWeather();
    };
    container.appendChild(btn);
  });
}

window.onload = () => {
  displaySearchHistory();
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
    document.getElementById("darkModeToggle").textContent = "☀️ Light Mode";
  }
};
