import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [data, setData] = useState({});
  const [forecast, setForecast] = useState([]);
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');

  const apiKey = '8f7e2295bf395e09b57e59950ee80a31';
  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${apiKey}`;

  const searchLocation = (event) => {
    if (event.key === 'Enter') {
      axios.get(weatherUrl).then((response) => {
        setData(response.data);
        setError('');

        const { lat, lon } = response.data.coord;
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

        return axios.get(forecastUrl);
      }).then((forecastResponse) => {
        setForecast(parseForecastData(forecastResponse.data.list));
      }).catch((error) => {
        setData({});
        setForecast([]);
        setError('Invalid city entered, please try again');
      });
      setLocation('');
    }
  };

  const parseForecastData = (list) => {
    const parsedData = {};
    const today = new Date().toISOString().split('T')[0];

    list.forEach(item => {
      const date = item.dt_txt.split(' ')[0];
      if (date !== today) {
        if (!parsedData[date]) {
          parsedData[date] = { tempSum: 0, count: 0, data: item };
        }
        parsedData[date].tempSum += item.main.temp;
        parsedData[date].count += 1;
      }
    });

    return Object.entries(parsedData).map(([date, value]) => {
      const avgTemp = value.tempSum / value.count;
      return [formatDate(date), { ...value.data, main: { ...value.data.main, temp: avgTemp } }];
    }).slice(0, 4); // Limit to next 4 days
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="app">
      <div className="search">
        <input
          value={location}
          onChange={event => setLocation(event.target.value)}
          onKeyPress={searchLocation}
          placeholder='Enter Location'
          type="text" />
        {error && <p className="error">{error}</p>}
      </div>
      <div className="container">
        <div className="top">
          <div className="location">
            <p>{data.name}</p>
          </div>
          <div className="temp">
            {data.main ? <h1>{data.main.temp.toFixed()}°C</h1> : null}
          </div>
          <div className="description">
            {data.weather ? <p>{data.weather[0].main}</p> : null}
          </div>
        </div>

        {data.name !== undefined &&
          <div className="bottom">
            <div className="feels">
              {data.main ? <p className='bold'>{data.main.feels_like.toFixed()}°C</p> : null}
              <p>Feels Like</p>
            </div>
            <div className="humidity">
              {data.main ? <p className='bold'>{data.main.humidity}%</p> : null}
              <p>Humidity</p>
            </div>
            <div className="wind">
              {data.wind ? <p className='bold'>{data.wind.speed.toFixed()} m/s</p> : null}
              <p>Wind Speed</p>
            </div>
          </div>
        }

        {forecast.length > 0 && (
          <div className="forecast">
            <h2>5-Day Forecast</h2>
            <div className="forecast-grid">
              {forecast.map(([date, data], index) => (
                <div key={index} className="forecast-column">
                  <h3>{date}</h3>
                  <div className="forecast-hour">
                    <p>{data.weather[0].description}</p>
                    <p>{data.main.temp.toFixed(2)}°C</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
