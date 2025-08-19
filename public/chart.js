
//get the starting node from the url query
const selectedNode = new URLSearchParams(window.location.search).get('node') || '1';
let dateToDisplay = new Date();
//store nodes to display in an array
let displayedNodes = [];
if (selectedNode !== '3') {
    displayedNodes = [selectedNode];
} else {
    displayedNodes = ['1', '2'];
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
        document.querySelector('.sensor-select').textContent = `${config.name}`;
    }
    else if (displayedNodes.length == 2) {
        document.querySelector('.sensor-select').textContent = `${config.name}`;
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
    const isMobile = window.innerWidth < 768;

    let series = [];

    const sensorData1 = datasets[0].data.map(row => [
        new Date(row.ts * 1000),
        row[config.id]
    ]);

    if (!(isWind && datasets.length == 2)) {
        series.push({
            type: isWind ? 'scatter' : 'line',
            data: sensorData1,
            name: isWind ? undefined : `Node ${datasets[0].node}`,
            smooth: true,
            lineStyle: {
                width: 3
            },
            symbol: isWind ? 'cross' : 'none',
            symbolSize: isWind ? 2 : 0,
            areaStyle: isWind ? undefined : { opacity: 0.35 },
            tooltip: isWind ? { show: false } : undefined
        });
    }

    let windAverages1 = [];
    let gustMaxes1 = [];
    let windAverages2 = [];
    let gustMaxes2 = [];
    if (isWind) {
        const windResult1 = await getHourlyWind(startTime, endTime, datasets[0].node);
        windAverages1 = windResult1.windAverages;
        gustMaxes1 = windResult1.gustMaxes;
        if (datasets[1]) {
            const windResult2 = await getHourlyWind(startTime, endTime, datasets[1].node);
            windAverages2 = windResult2.windAverages;
            gustMaxes2 = windResult2.gustMaxes;
        }
    }

    if (isWind) {
        series.push({
            name: `Node ${datasets[0].node} avg`,
            type: 'line',
            data: windAverages1,
            smooth: true,
            symbol: 'none',
            color: datasets.length == 1 ? "#6F277D" : "#5070dd",
            lineStyle: {
                width: 4, color: datasets.length == 1 ? "#6F277D" : "#5070dd",
            },
        });
        series.push({
            name: `Node ${datasets[0].node} gusts`,
            type: 'line',
            data: gustMaxes1,
            smooth: true,
            symbol: 'none',
            color: datasets.length == 1 ? "#AC1C7C" : "#42ccdb",
            lineStyle: {
                width: 4, color: datasets.length == 1 ? "#AC1C7C" : "#42ccdb",
            },
        });
    }

    if (datasets.length == 1) {
        const option = {
            grid: {
                left: 0,
                right: 0,
                top: 25,
                bottom: isWind ? 50 : 25,
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
            tooltip: { trigger: 'axis' }
        }
        chart.setOption(option, true);

        if (isWind) {
            applyMobileLegendStyle(chart);
        }

    } else if (datasets.length == 2) {

        const sensorData2 = datasets[1].data.map(row => [
            new Date(row.ts * 1000),
            row[config.id]
        ]);
        if (!isWind) {
            series.push({
                name: isWind ? undefined : `Node ${datasets[1].node}`,
                type: isWind ? 'scatter' : 'line',
                data: isWind ? undefined : sensorData2,
                smooth: true,
                symbol: isWind ? 'circle' : 'none',
                symbolSize: isWind ? 2 : 0,
                lineStyle: { width: 3 },
                areaStyle: isWind ? undefined : { opacity: 0.1 },
                tooltip: isWind ? { show: false } : undefined
            });
        }

        if (isWind) {
            series.push({
                name: `Node ${datasets[1].node} avg`,
                type: 'line',
                data: windAverages2,
                smooth: true,
                symbol: 'none',
                lineStyle: { width: 4 },
                color: "#b6d634"
            });
            series.push({
                name: `Node ${datasets[1].node} gusts`,
                type: 'line',
                data: gustMaxes2,
                smooth: true,
                symbol: 'none',
                lineStyle: { width: 4 },
                color: "#ff994d"
            });
        }

        const option = {
            grid: {
                left: 0,
                right: 0,
                top: 25,
                bottom: 50,
                containLabel: true
            },
            legend: {
                data: series.map(s => s.name),
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
            tooltip: { trigger: 'axis', }
        };

        chart.setOption(option, true);
        applyMobileLegendStyle(chart)
    }
    //resize on window change
    window.addEventListener('resize', () => {
        chart.resize();
        if (datasets.length == 2 || isWind) {
            applyMobileLegendStyle(chart);
        }
        console.log(chart.getWidth());
    });
};

function applyMobileLegendStyle(chart) {
    const width = chart.getWidth();
    const smallScreen = width > 700 && width < 1200;;
    const mobileScreen = width <= 700;
    chart.setOption({
        legend: {
            bottom: 0,
            icon: 'rect',
            left: 'center',
            itemWidth: 25,
            textStyle: {
                fontWeight: 'bold',
                fontSize: mobileScreen ? 13 : smallScreen ? 18 : 25
            },
            itemHeight: mobileScreen ? 9 : smallScreen ? 14 : 19,
            itemGap: mobileScreen ? 14 : smallScreen ? 28 : 50,

        },
    }, false);
}

async function getHourlyWind(startTime, endTime, node) {
    const HOUR_IN_SECS = 60 * 60;

    let loopCountStart = startTime - (0.5 * HOUR_IN_SECS);
    let loopCountEnd = startTime + (0.5 * HOUR_IN_SECS);

    const windAverages = [];
    const gustMaxes = [];

    let data;
    try {
        const response = await fetch(`/api/database/select-node-range?requestedTable=node_data&start=${loopCountStart}&end=${endTime + 0.5 * HOUR_IN_SECS}&node=${node}`);
        data = await response.json();
        console.log(`Received ${data.length} rows of data`);
    } catch (error) {
        console.error(`Failed to fetch hourly data`, error);
        return { windAverages: [], gustMaxes: [] };
    }

    if (data.length == 0) {
        console.log("No data for this time period")
        return { windAverages: [], gustMaxes: [] };
    }

    let count = 0;
    let i = 0;
    while (loopCountEnd <= endTime + (0.5 * HOUR_IN_SECS)) {
        if (i >= data.length) {
            windAverages.push([new Date((loopCountStart + (0.5 * HOUR_IN_SECS)) * 1000), null]);
            gustMaxes.push([new Date((loopCountStart + (0.5 * HOUR_IN_SECS)) * 1000), null]);
            console.log(windAverages[count], gustMaxes[count]);
        } else {
            let windSum = 0, gustMax = 0, n = 0;
            while (i < data.length && data[i].ts < loopCountEnd) {
                windSum += data[i].wind_speed;
                if (data[i].gust_speed > gustMax) {
                    gustMax = data[i].gust_speed;
                }
                n++;
                i++;
            }
            if (n > 0) {
                const average = Math.round((windSum / n) * 10) / 10;
                windAverages.push([new Date((loopCountStart + (0.5 * HOUR_IN_SECS)) * 1000), average]);
                gustMaxes.push([new Date((loopCountStart + (0.5 * HOUR_IN_SECS)) * 1000), gustMax]);
                console.log(windAverages[count], gustMaxes[count]);
            } else {
                windAverages.push([new Date((loopCountStart + (0.5 * HOUR_IN_SECS)) * 1000), null]);
                gustMaxes.push([new Date((loopCountStart + (0.5 * HOUR_IN_SECS)) * 1000), null]);
                console.log(windAverages[count], gustMaxes[count]);
            }
        }
        loopCountStart += HOUR_IN_SECS;
        loopCountEnd += HOUR_IN_SECS;
        count++;
        console.log(`loop ${count} completed`)
    }

    return { windAverages, gustMaxes };
}





