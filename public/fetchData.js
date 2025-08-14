document.addEventListener('DOMContentLoaded', () => {

  document.querySelector('#location').insertAdjacentText('beforeend', "Chipping Sodbury")

  fetch('/api/database/select-latest?requestedTable=node_data&selectColumn=*&conditionColumn=node_name&value=1')
    .then(res => {
      return res.json();
    })
    .then(data => {
      console.log('received', data)
      document.querySelector('#temperature-1').insertAdjacentText('afterbegin', data.temperature)
      document.querySelector('#humidity-1').insertAdjacentText('afterbegin', data.humidity)
      document.querySelector('#wind-speed-1').insertAdjacentText('afterbegin', data.wind_speed)
      document.querySelector('#soil-moisture-1').insertAdjacentText('afterbegin', data.soil_moisture)
      const britishTime = new Date(data.ts * 1000).toLocaleString('en-GB', { timeZone: 'Europe/London' });
      document.querySelector('#timestamp-1').insertAdjacentText('beforeend', britishTime)
      document.querySelector('#gust-speed-1').insertAdjacentText('beforeend', data.gust_speed + ' m/s')
    })
    .catch(error => console.log(error));

  fetch('/api/database/select-latest?requestedTable=node_data&selectColumn=*&conditionColumn=node_name&value=2')
    .then(res => {
      return res.json();
    })
    .then(data => {
      console.log('received', data)
      document.querySelector('#temperature-2').insertAdjacentText('afterbegin', data.temperature)
      document.querySelector('#humidity-2').insertAdjacentText('afterbegin', data.humidity)
      document.querySelector('#wind-speed-2').insertAdjacentText('afterbegin', data.wind_speed)
      document.querySelector('#soil-moisture-2').insertAdjacentText('afterbegin', data.soil_moisture)
      const britishTime = new Date(data.ts * 1000).toLocaleString('en-GB', { timeZone: 'Europe/London' });
      document.querySelector('#timestamp-2').insertAdjacentText('beforeend', britishTime)
      document.querySelector('#gust-speed-2').insertAdjacentText('beforeend', data.gust_speed + ' m/s')
    })
    .catch(error => console.log(error));
});
