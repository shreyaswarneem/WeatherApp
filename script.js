// ✅ Select necessary elements
const cityInput = document.querySelector('.city-input');
const searchBtn = document.querySelector('.search-btn');

const weatherInformationSection = document.querySelector('.weather-information');
const notFoundSection = document.querySelector('.not-found');
const loadingElement = document.getElementById('loading');

const apiKey = 'd52a61479757859cce0022d0760a0e7f'; // Replace with your actual OpenWeatherMap API key

// ✅ Add event listeners for search
searchBtn.addEventListener("click", handleSearch);
searchBtn.addEventListener("touchstart", (event) => {
    event.preventDefault();
    handleSearch();
}, { passive: false });

// ✅ Function to handle search input
function handleSearch(event) {
    if (event) event.preventDefault();

    const city = cityInput.value.trim();
    if (city !== '') {
        updateWeatherInfo(city);
        cityInput.value = '';
    }
}

// ✅ Fetch data from OpenWeather API
async function getFetchData(endpoint, city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/${endpoint}?q=${city}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch data:", error);
        return null;
    }
}

// ✅ Update weather & forecast information
async function updateWeatherInfo(city) {
    if (loadingElement) loadingElement.style.display = 'flex'; // Show loading spinner

    const weatherData = await getFetchData('weather', city);
    const forecastData = await getFetchData('forecast', city);

    if (loadingElement) loadingElement.style.display = 'none'; // Hide loading spinner

    if (!weatherData || weatherData.cod !== 200) {
        notFoundSection.style.display = 'block';
        weatherInformationSection.style.display = 'none';
        return;
    }

    notFoundSection.style.display = 'none';
    weatherInformationSection.style.display = 'block';
    displayWeatherData(weatherData);
    displayForecastData(forecastData);
}

// ✅ Display weather data
function displayWeatherData(data) {

  document.querySelector('.country-text').textContent = `${data.name}, ${data.sys.country}`;

    const tempElement = document.querySelector('.temp-txt');
    tempElement.setAttribute("data-temp", data.main.temp);
    updateTemperature();

    document.querySelector('.condition-txt').textContent = data.weather[0].description;
    document.querySelector('.humidity-value-txt').textContent = `${data.main.humidity}%`;
    document.querySelector('.wind-value-txt').textContent = `${data.wind.speed} M/s`;

    // ✅ Update weather icon
    const weatherIcon = data.weather[0].icon;
    document.querySelector('.weather-summary').src = `https://openweathermap.org/img/wn/${weatherIcon}@2x.png`;

}
// ✅ Display 5-day forecast data
function displayForecastData(data) {
    const forecastContainer = document.querySelector('.forecast-item-container');
    forecastContainer.innerHTML = ''; // Clear previous data

    if (!data.list) {
        console.error("Forecast data is missing:", data);
        return;
    }

    // ✅ Use an object to store only 5 unique dates
    const forecastDays = {};

    // ✅ Loop through forecast list and store only the first entry for each day
    data.list.forEach(forecast => {
        const dateObj = new Date(forecast.dt * 1000);
        const dateKey = dateObj.toISOString().split('T')[0]; // Extract YYYY-MM-DD

        // ✅ Ensure only one entry per day, prefer 12:00 PM
        if (!forecastDays[dateKey] || (dateObj.getHours() === 12 && !forecastDays[dateKey].preferred)) {
            forecastDays[dateKey] = { forecast, preferred: dateObj.getHours() === 12 };
        }
    });

    // ✅ Convert Object to Array and display only 5 days
    Object.keys(forecastDays).slice(0, 5).forEach(dateKey => {
        const forecast = forecastDays[dateKey].forecast;
        const date = new Date(forecast.dt * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
        const temp = Math.round(forecast.main.temp);
        const icon = forecast.weather[0].icon;

        forecastContainer.innerHTML += `
            <div class="forecast-item">
                <div class="forecast-item-date">${date}</div>
                <img src="https://openweathermap.org/img/wn/${icon}.png" alt="Weather Icon" class="forecast-item-icon">
                <h5 class="forecast-item-temp">${temp}°C</h5>
            </div>
        `;
    });
}

// ✅ Temperature Unit Toggle (°C ⇄ °F)
const unitToggle = document.getElementById("unit-toggle");
let isCelsius = localStorage.getItem("temperature-unit") !== "F"; // Default is Celsius

function convertTemperature(tempC) {
    return isCelsius ? tempC : (tempC * 9/5) + 32;
}

// ✅ Update temperature display
function updateTemperature() {
    const tempElement = document.querySelector('.temp-txt');
    if (tempElement) {
        let currentTemp = parseFloat(tempElement.getAttribute("data-temp"));
        tempElement.textContent = `${Math.round(convertTemperature(currentTemp))}°${isCelsius ? "C" : "F"}`;
    }
}

// ✅ Toggle unit & update temperature
unitToggle.addEventListener("click", () => {
    isCelsius = !isCelsius;
    localStorage.setItem("temperature-unit", isCelsius ? "C" : "F");
    unitToggle.textContent = isCelsius ? "°C" : "°F";
    updateTemperature();
});

// ✅ Restore last selected unit on page load
if (!isCelsius) {
    unitToggle.textContent = "°F";
}
