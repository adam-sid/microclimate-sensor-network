document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('#location').insertAdjacentText('beforeend', "Chipping Sodbury")
  fetchData(false);

  const TWO_MINUTES = 2 * 60 * 1000;
  setInterval(() => fetchData(true), TWO_MINUTES);
});

function fetchData(isReload) {
  updateNodeData(1);
  updateNodeData(2);
  isReload ? console.log("page reloaded") : undefined;
}


function updateNodeData(nodeId) {
  fetch(`/api/database/select-latest?requestedTable=node_data&selectColumn=*&conditionColumn=node_name&value=${nodeId}`)
    .then(res => {
      return res.json();
    })
    .then(data => {
      console.log('received', data)
      document.querySelector(`#temperature-${nodeId}`).textContent = data.temperature + `°C`;
      document.querySelector(`#humidity-${nodeId}`).textContent = data.humidity + `%`;
      document.querySelector(`#wind-speed-${nodeId}`).textContent = data.wind_speed + `m/s`;
      let soil_moisture = updateSoilMoisture(data.soil_moisture);
      document.querySelector(`#soil-moisture-${nodeId}`).textContent = soil_moisture + ``;
      const britishTime = new Date(data.ts * 1000).toLocaleString('en-GB', { timeZone: 'Europe/London' });
      document.querySelector(`#timestamp-${nodeId}`).textContent = `Last updated: ${britishTime}`;
      document.querySelector(`#gust-speed-${nodeId}`).textContent = `with gusts of ${data.gust_speed}m/s`;
    })
    .catch(error => console.log(error));
}

function updateSoilMoisture(raw_value) {
  if (raw_value > 45000) {
    return "Very dry";
  } else if (raw_value <= 45000 && raw_value > 35000) {
    return "Dry";
  } else if (raw_value <= 35000 && raw_value > 25000) {
    return "Damp";
  } else if (raw_value <= 25000 && raw_value > 20000) {
    return "Wet";
  } else if (raw_value <= 20000 && raw_value >= 10000) {
    return "Saturated";
  } else {
    return "No data"
  }
}

