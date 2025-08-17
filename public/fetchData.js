document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('#location').insertAdjacentText('beforeend', "Chipping Sodbury")
  fetchData(false);

  const TWO_MINUTES = 2 * 60 * 1000;
  setInterval(fetchData(true), TWO_MINUTES);
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
      document.querySelector(`#soil-moisture-${nodeId}`).textContent = data.soil_moisture + ``;
      const britishTime = new Date(data.ts * 1000).toLocaleString('en-GB', { timeZone: 'Europe/London' });
      document.querySelector(`#timestamp-${nodeId}`).textContent = `Last updated: ${britishTime}`;
      document.querySelector(`#gust-speed-${nodeId}`).textContent = `with gusts of ${data.gust_speed}m/s`;
    })
    .catch(error => console.log(error));
}