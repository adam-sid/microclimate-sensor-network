
//get the starting node from the url query
const selectedNode = new URLSearchParams(window.location.search).get('node') || '1';
let dateToDisplay = new Date();
//store nodes to display in an array
let displayedNodes = [];
if (selectedNode !== '3') {
    displayedNodes = [selectedNode];
} else {
    displayedNodes = ['1', '2']; // keep types consistent
}

document.addEventListener('DOMContentLoaded', () => {
    //select the node being displayed at start
    document.getElementById(`node${selectedNode}`).checked = true;

    displayChart();

    document.querySelector(".node-tick-box").addEventListener('change', (e) => {
        const displayOption = e.target.value;

        const url = new URL(window.location);
        url.searchParams.set('node', displayOption);
        history.replaceState(null, '', url);

        if (displayOption === '1') {
            displayedNodes = ['1'];
        } else if (displayOption === '2') {
            displayedNodes = ['2'];
        } else if (displayOption === '3') {
            displayedNodes = ['1', '2'];
        } else {
            displayedNodes = [];
        }
        displayChart();
    });

    document.getElementById('go-back').addEventListener('click', () => {
        dateToDisplay.setDate(dateToDisplay.getDate() - 1);
        displayChart();
    });

    document.getElementById('go-forward').addEventListener('click', () => {
        dateToDisplay.setDate(dateToDisplay.getDate() + 1);
        displayChart();
    });
});

function displayChart() {

    document.getElementById('date-to-display').textContent = dateToDisplay.toLocaleDateString(
        'en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const chartType = document.querySelector('main').getAttribute('chart-type');
    if (!chartType) { return; }
    const config = getChartConfig(chartType);
    if (!config) { return; }

    const chartDom = document.querySelector(config.selector);
    const startTime = new Date((dateToDisplay.getFullYear()), dateToDisplay.getMonth(), dateToDisplay.getDate()).getTime() / 1000;
    const endTime = startTime + 24 * 60 * 60;

    //handle graph title
    if (displayedNodes.length == 1) {
        document.querySelector('.node-select').textContent = `${config.name} for node ${displayedNodes[0]}`;
    }
    else if (displayedNodes.length == 2) {
        document.querySelector('.node-select').textContent = `${config.name} for nodes ${displayedNodes[0]} and ${displayedNodes[1]}`;
    }
    else {
        document.querySelector('.node-select').textContent = "Select node to display chart"
        buildChart(chartDom, [], config, startTime, endTime);
        return;
    }

    if (displayedNodes.length == 1) {
        fetch(`/api/database/select-node-range?requestedTable=node_data&start=${startTime}&end=${endTime}&node=${displayedNodes[0]}`)
            .then(res => {
                return res.json();
            })
            .then(async data => {
                const datasets = [{ node: displayedNodes[0], data: data }];
                await buildChart(chartDom, datasets, config, startTime, endTime);
            })
    } else if (displayedNodes.length == 2) {
        let datasets = [];
        fetch(`/api/database/select-node-range?requestedTable=node_data&start=${startTime}&end=${endTime}&node=${displayedNodes[0]}`)
            .then(res => {
                return res.json();
            })
            .then(data1 => {
                datasets.push({ node: displayedNodes[0], data: data1 });
                return fetch(`/api/database/select-node-range?requestedTable=node_data&start=${startTime}&end=${endTime}&node=${displayedNodes[1]}`);
            })
            .then(res => {
                return res.json();
            })
            .then(async data2 => {
                datasets.push({ node: displayedNodes[1], data: data2 })
                await buildChart(chartDom, datasets, config, startTime, endTime)
            })
    } else {
        console.log("Error: invalid number of nodes")
    }

}

function getChartConfig(chartType) {
    switch (chartType) {
        case "temperature":
            console.log("Returned temp config");
            return {
                id: "temperature",
                selector: ".temperature-chart",
                name: "Temperature",
                min: -5,
                max: 40,
                colours: ["#524ed2", "#05a2a2", "#d8a100", "#c52f21"],
                unit: "°C"
            };
        case "humidity":
            console.log("Returned humidity config");
            return {
                id: "humidity",
                selector: ".humidity-chart",
                name: "Humidity",
                min: 0,
                max: 100,
                colours: ["#bfc3fa", "#0f2d70"],
                unit: "%"
            };
        case "wind":
            console.log("Returned wind config");
            return {
                id: "wind_speed",
                selector: ".wind-chart",
                name: "Wind speed",
                min: 0,
                max: 32,
                colours: ["#043737", "#0ccece"],
                unit: "m/s"
            };
        case "soil":
            console.log("Returned soil config");
            return {
                id: "soil_moisture",
                selector: ".soil-chart",
                name: "Soil moisture",
                min: 18000,
                max: 55000,
                colours: ["#FECC63", "#312302"],
                unit: "n/a"
            };
        default:
            return null;
    }
}

async function buildChart(chartDom, datasets, config, startTime, endTime) {
    const chart = echarts.getInstanceByDom(chartDom) || echarts.init(chartDom);
    const isWind = config.id == 'wind_speed'

    let windHourlyArr1 = [];
    let windHourlyArr2 = [];
    if (isWind) {
        typeOfChart = "scatter"
        windHourlyArr1 = await getHourlyWind(startTime, endTime, datasets[0].node);
        if (datasets[1]) {
            windHourlyArr2 = await getHourlyWind(startTime, endTime, datasets[1].node);
        }
    }
    const sensorData1 = datasets[0].data.map(row => [
        new Date(row.ts * 1000),
        row[config.id]
    ]);

    const series = [{
        type: isWind ? 'scatter' : 'line',
        data: sensorData1,
        name: `Node ${datasets[0].node}`,
        smooth: true,
        lineStyle: {
            width: 3
        },
        symbol: isWind ? 'cross' : 'none',
        symbolSize: isWind ? 6 : 0,
        areaStyle: isWind ? undefined : { opacity: 0.35 }
    }];

    if (isWind) {
        series.push({
            name: `Node ${datasets[0].node} average`,
            type: 'line',
            data: windHourlyArr1,
            smooth: true,
            symbol: 'none',
            lineStyle: { width: 4, type: 'dashed' }
        });
    }

    if (datasets.length == 1) {
        const option = {
            grid: {
                left: 25,
                right: 25,
                top: 25,
                bottom: 25,
                containLabel: true
            },
            //set colour gradient using visual map
            visualMap: {
                show: false,
                min: config.min,
                max: config.max,
                dimension: 1,
                inRange: {
                    color: config.colours
                }
            },
            xAxis: {
                type: 'time',
                min: startTime * 1000,
                max: endTime * 1000
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    formatter: `{value} ${config.unit}`
                }
            },
            series: series,
            tooltip: {
                trigger: 'axis',
                position: (pt) => [pt[0], '1%'],
            }

        }

        chart.setOption(option, true);

    } else if (datasets.length == 2) {

        const sensorData2 = datasets[1].data.map(row => [
            new Date(row.ts * 1000),
            row[config.id]
        ]);

        series.push({
            name: `Node ${datasets[1].node}`,
            type: isWind ? 'scatter' : 'line',
            data: sensorData2,
            smooth: true,
            symbol: isWind ? 'circle' : 'none',
            symbolSize: isWind ? 6 : 0,
            lineStyle: { width: 3 },
            areaStyle: isWind ? undefined : { opacity: 0.1 }
        });

        if (isWind) {
            series.push({
                name: `Node ${datasets[1].node} average`,
                type: 'line',
                data: windHourlyArr2,
                smooth: true,
                symbol: 'none',
                lineStyle: { width: 4, type: 'dashed' }
            });
        }

        const option = {
            grid: {
                left: 25,
                right: 25,
                top: 25,
                bottom: 50,
                containLabel: true
            },
            legend: {
                data: series.map(s => s.name),
                bottom: 0,
                icon: 'rect',
                left: 'center',
                itemWidth: 19,
                itemHeight: 19,
                itemGap: 50,
                textStyle: {
                    fontSize: 25,
                    fontWeight: 'bold'
                }
            },
            xAxis: {
                type: 'time',
                min: startTime * 1000,
                max: endTime * 1000,
            },
            yAxis: {
                type: 'value',
                axisLabel: { formatter: `{value} ${config.unit}` }
            },
            series: series,
            tooltip: {
                trigger: 'axis',
                position: (pt) => [pt[0], '1%'],
            }
        };
        chart.setOption(option, true);

    }
    //resize on window change
    window.addEventListener('resize', () => { chart.resize(); });
};

async function getHourlyWind(startTime, endTime, node) {
    const HOUR_IN_SECS = 60 * 60;

    let loopCountStart = startTime - (0.5 * HOUR_IN_SECS);
    let loopCountEnd = startTime + (0.5 * HOUR_IN_SECS);
    const windHourlyArr = [];

    let count = 0;
    while (loopCountEnd <= endTime + (0.5 * HOUR_IN_SECS)) {
        try {
            const response = await fetch(`/api/database/select-node-range?requestedTable=node_data&start=${loopCountStart}&end=${loopCountEnd}&node=${node}`);
            const data = await response.json();
            if (data.length == 0) {
                windHourlyArr.push([new Date((loopCountStart + (0.5 * HOUR_IN_SECS)) * 1000), null]);
                console.log(windHourlyArr[count]);
            } else {
                let sum = 0, n = 0;
                for (let i = 0; i < data.length; i++) {
                    sum += data[i].wind_speed;
                    n++;
                }
                const average = sum / n;
                windHourlyArr.push([new Date((loopCountStart + (0.5 * HOUR_IN_SECS)) * 1000), average]);
                console.log(windHourlyArr[count]);
            }
        } catch (error) {
            console.error(`Failed to fetch hourly data`, error);
            windHourlyArr.push([new Date((loopCountStart + (0.5 * HOUR_IN_SECS)) * 1000), null]);
        }

        loopCountStart += HOUR_IN_SECS;
        loopCountEnd += HOUR_IN_SECS;
        count++;
    }

    return windHourlyArr;
}


