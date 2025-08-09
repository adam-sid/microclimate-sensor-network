document.addEventListener('DOMContentLoaded', () => {
  fetch('/api/chipping-sodbury?column=temperature&device_id=1')
    .then(res => {
      return res.json();
    })
    .then(data => {
      console.log('received', data)
      document.querySelector('#temperature-1').insertAdjacentText('beforeend', data.temperature)
    })
    .catch(error => console.log(error));

  fetch('/api/chipping-sodbury?column=humidity&device_id=1')
    .then(res => {
      return res.json();
    })
    .then(data => {
      console.log('received', data)
      document.querySelector('#humidity-1').insertAdjacentText('beforeend', data.humidity)
    })
    .catch(error => console.log(error));

  fetch('/api/chipping-sodbury?column=wind_speed&device_id=1')
    .then(res => {
      return res.json();
    })
    .then(data => {
      console.log('received', data)
      document.querySelector('#wind-speed-1').insertAdjacentText('beforeend', data.wind_speed)
    })
    .catch(error => console.log(error));

  fetch('/api/chipping-sodbury?column=soil_moisture&device_id=1')
    .then(res => {
      return res.json();
    })
    .then(data => {
      console.log('received', data)
      document.querySelector('#soil-moisture-1').insertAdjacentText('beforeend', data.soil_moisture)
    })
    .catch(error => console.log(error));

  document.querySelector('#location').insertAdjacentText('beforeend', "Chipping Sodbury")

  fetch('/api/chipping-sodbury?column=temperature&device_id=2')
    .then(res => {
      return res.json();
    })
    .then(data => {
      console.log('received', data)
      document.querySelector('#temperature-2').insertAdjacentText('beforeend', data.temperature)
    })
    .catch(error => console.log(error));

  fetch('/api/chipping-sodbury?column=humidity&device_id=2')
    .then(res => {
      return res.json();
    })
    .then(data => {
      console.log('received', data)
      document.querySelector('#humidity-2').insertAdjacentText('beforeend', data.humidity)
    })
    .catch(error => console.log(error));

  fetch('/api/chipping-sodbury?column=wind_speed&device_id=2')
    .then(res => {
      return res.json();
    })
    .then(data => {
      console.log('received', data)
      document.querySelector('#wind-speed-2').insertAdjacentText('beforeend', data.wind_speed)
    })
    .catch(error => console.log(error));

  fetch('/api/chipping-sodbury?column=soil_moisture&device_id=2')
    .then(res => {
      return res.json();
    })
    .then(data => {
      console.log('received', data)
      document.querySelector('#soil-moisture-2').insertAdjacentText('beforeend', data.soil_moisture)
    })
    .catch(error => console.log(error));
});
