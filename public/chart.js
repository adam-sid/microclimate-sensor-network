
//get the starting node from the url query
urlQueryParams = new URLSearchParams(window.location.search);

const selectedNode = urlQueryParams.get('node') || '1';
const selectedDate = urlQueryParams.get('date');

let dateToDisplay = new Date();
if (selectedDate) {
    dateToDisplay = new Date(parseInt(selectedDate) * 1000);
}

//store nodes to display in an array
let displayedNodes = [];
if (selectedNode !== '3') {
    displayedNodes = [selectedNode];
} else {
    displayedNodes = ['1', '2'];
}

const isTouchDevice = navigator.maxTouchPoints > 0;

LEGEND_SCALE = 1.25;
const HOUR_IN_MS = 60 * 60 * 1000;

document.addEventListener('DOMContentLoaded', () => {
    //select the node being displayed at start
    document.querySelector('#node-select').value = selectedNode;

    displayChart();

    document.querySelector('#node-select').addEventListener('change', (e) => {
        const nodeValue = e.target.value;
        setNodeDateUrl(nodeValue);

        if (nodeValue == '1') {
            displayedNodes = ['1'];
        } else if (nodeValue == '2') {
            displayedNodes = ['2'];
        } else if (nodeValue == '3') {
            displayedNodes = ['1', '2'];
        } else {
            displayedNodes = [];
        }
        displayChart();
    });

    document.getElementById('go-back').addEventListener('click', () => {
        dateToDisplay.setDate(dateToDisplay.getDate() - 1);
        setNodeDateUrl(document.querySelector('#node-select').value);
        displayChart();
    });

    document.getElementById('go-forward').addEventListener('click', () => {
        dateToDisplay.setDate(dateToDisplay.getDate() + 1);
        setNodeDateUrl(document.querySelector('#node-select').value);
        displayChart();
    });
});

function setNodeDateUrl(nodeValue) {
    const url = new URL(window.location);
    url.searchParams.set('node', nodeValue);
    url.searchParams.set('date', Math.floor(dateToDisplay.getTime() / 1000));
    history.replaceState(null, '', url);
}

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
            return {
                id: "soil_moisture",
                selector: ".soil-chart",
                name: "Soil moisture",
                min: 18000,
                max: 55000,
                colours: ["#312302", "#FECC63"],
                unit: "n/a"
            };
        default:
            console.log(`Case ${chartType} is unknown`);
            return null;
    }
}

async function buildChart(chartDom, datasets, config, startTime, endTime) {
    const chart = echarts.getInstanceByDom(chartDom) || echarts.init(chartDom);
    const isWind = config.id == 'wind_speed'

    const startTimeMs = startTime * 1000;
    const endTimeMs = endTime * 1000;

    let series = [];

    const sensorData1 = datasets[0].data.map(row => [
        new Date(row.ts * 1000),
        row[config.id]
    ]);

    const forecastData1 = await getForecastData(datasets[0].node);

    if (forecastData1 != null) {
        const forecastSeries1 = forecastData1.map(row => [
            new Date(row.ts * 1000),
            row[config.id]
        ]);

        series.push({
            name: isWind ? `Forecast wind ${datasets[0].node}` : `Forecast ${datasets[0].node}`,
            type: 'line',
            data: forecastSeries1,
            color: isWind ? (datasets.length === 2 ? "#5070dd" : "#6F277D") : "#5070dd",
            lineStyle: {
                type: 'dashed'
            }
        });
    }

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
            itemStyle: { color: datasets.length == 1 ? "#6F277D" : "#5070dd" },
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
            itemStyle: { color: datasets.length == 1 ? "#AC1C7C" : "#42ccdb" },
            color: datasets.length == 1 ? "#AC1C7C" : "#42ccdb",
            lineStyle: {
                width: 4, color: datasets.length == 1 ? "#AC1C7C" : "#42ccdb",
            },
        });
        if (forecastData1 != null) {
            const gustSeries1 = forecastData1.map(row => [
                new Date(row.ts * 1000),
                row.gust_speed
            ]);
            series.push({
                name: `Forecast gusts ${datasets[0].node}`,
                type: 'line',
                data: gustSeries1,
                itemStyle: { color: datasets.length == 1 ? "#AC1C7C" : "#42ccdb" },
                color: datasets.length == 1 ? "#AC1C7C" : "#42ccdb",
                lineStyle: {
                    type: 'dashed'
                }
            });
        }
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
            visualMap: isWind ? undefined : {
                show: false,
                min: config.min,
                max: config.max,
                dimension: 1,
                inRange: {
                    color: config.colours
                }
            },
            legend: isWind ? {
                data: series
                    .filter(s => s.name && !s.name.includes('Forecast'))
                    .map(s => s.name)
            } : undefined,
            xAxis: {
                type: 'time',
                min: startTimeMs,
                max: endTimeMs,
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    formatter: `{value} ${config.unit}`,
                }
            },
            series: series,
            tooltip: {
                trigger: 'axis',
                position: function (point, params, dom, rect, size) {
                    //size of tooltip element
                    const tooltipWidth = dom.offsetWidth;
                    const tooltipHeight = dom.offsetHeight;
                    //size of chart
                    const chartWidth = chart.getWidth();
                    //if tooltip is not hitting edge of graph
                    let x = point[0] + (isTouchDevice ? 20 : 0);
                    //else
                    if (x + tooltipWidth > chartWidth) {
                        x = point[0] - tooltipWidth - (isTouchDevice ? 20 : 0);
                    }
                    return [x, point[1] - tooltipHeight - (isTouchDevice ? 20 : 0)];
                }
            },
        }
        chart.setOption(option, true);
        updateAxisOnResize(chart, startTimeMs);
        if (isWind) {
            applyMobileLegendStyle(chart);
        }

    } else if (datasets.length == 2) {

        const sensorData2 = datasets[1].data.map(row => [
            new Date(row.ts * 1000),
            row[config.id]
        ]);

        const forecastData2 = await getForecastData(datasets[1].node);

        if (forecastData2 != null) {
            const forecastSeries2 = forecastData2.map(row => [
                new Date(row.ts * 1000),
                row[config.id]
            ]);

            series.push({
                name: isWind ? `Forecast wind ${datasets[1].node}` : `Forecast ${datasets[1].node}`,
                type: 'line',
                data: forecastSeries2,
                color: "#b6d634",
                lineStyle: {
                    type: 'dashed'
                }
            });
        }

        if (!isWind) {
            series.push({
                name: isWind ? undefined : `Node ${datasets[1].node}`,
                type: isWind ? 'scatter' : 'line',
                data: isWind ? undefined : sensorData2,
                smooth: true,
                symbol: isWind ? 'circle' : 'none',
                symbolSize: isWind ? 2 : 0,
                color: "#b6d634",
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
            const gustSeries2 = forecastData2.map(row => [
                new Date(row.ts * 1000),
                row.gust_speed
            ]);
            series.push({
                name: `Forecast gusts ${datasets[1].node}`,
                type: 'line',
                data: gustSeries2,
                itemStyle: { color: "#ff994d" },
                color: "#ff994d",
                lineStyle: {
                    type: 'dashed'
                }
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
                data: series
                    .filter(s => s.name && !s.name.includes('Forecast'))
                    .map(s => s.name)
            },
            xAxis: {
                type: 'time',
                min: startTimeMs,
                max: endTimeMs,
            },
            yAxis: {
                type: 'value',
                axisLabel: { formatter: `{value} ${config.unit}` }
            },
            series: series,
            tooltip: {
                trigger: 'axis',
                position: function (point, params, dom, rect, size) {
                    //size of tooltip element
                    const tooltipWidth = dom.offsetWidth;
                    const tooltipHeight = dom.offsetHeight;
                    //size of chart
                    const chartWidth = chart.getWidth();
                    //if tooltip is not hitting edge of graph
                    let x = point[0];
                    //else
                    if (x + tooltipWidth > chartWidth) {
                        x = point[0] - tooltipWidth;
                    }
                    return [x, point[1] - tooltipHeight];
                }
            }

        }


        chart.setOption(option, true);
        updateAxisOnResize(chart, startTimeMs);
        applyMobileLegendStyle(chart);
    }
    //resize on window change
    window.addEventListener('resize', () => {
        chart.resize();
        updateAxisOnResize(chart, startTimeMs);
        if (datasets.length == 2 || isWind) {
            applyMobileLegendStyle(chart);
        }
    });
};

function updateAxisOnResize(chart, startTimeMs) {
    const width = chart.getWidth();
    const mobileScreen = width <= 700;
    if (!mobileScreen) {
        chart.setOption({
            xAxis: [{
                axisLabel: {
                    formatter: '{HH}:{mm}',
                    customValues: [startTimeMs, startTimeMs + 3 * HOUR_IN_MS,
                        startTimeMs + 6 * HOUR_IN_MS, startTimeMs + 9 * HOUR_IN_MS,
                        startTimeMs + 12 * HOUR_IN_MS, startTimeMs + 15 * HOUR_IN_MS,
                        startTimeMs + 18 * HOUR_IN_MS, startTimeMs + 21 * HOUR_IN_MS],
                },
                axisTick: {
                    alignWithLabel: true,
                    customValues: [startTimeMs, startTimeMs + 3 * HOUR_IN_MS,
                        startTimeMs + 6 * HOUR_IN_MS, startTimeMs + 9 * HOUR_IN_MS,
                        startTimeMs + 12 * HOUR_IN_MS, startTimeMs + 15 * HOUR_IN_MS,
                        startTimeMs + 18 * HOUR_IN_MS, startTimeMs + 21 * HOUR_IN_MS]
                },
                splitLine: {
                    show: true,
                    lineStyle: { opacity: 0.25 }
                }
            }]
        }, false);
    } else {
        chart.setOption({
            xAxis: [{
                axisLabel: {
                    formatter: '{HH}:{mm}',
                    customValues: [startTimeMs,
                        startTimeMs + 6 * HOUR_IN_MS,
                        startTimeMs + 12 * HOUR_IN_MS,
                        startTimeMs + 18 * HOUR_IN_MS],
                },
                axisTick: {
                    alignWithLabel: true,
                    customValues: [startTimeMs,
                        startTimeMs + 6 * HOUR_IN_MS,
                        startTimeMs + 12 * HOUR_IN_MS,
                        startTimeMs + 18 * HOUR_IN_MS]
                },
                splitLine: {
                    show: true,
                    lineStyle: { opacity: 0.25 }
                },

            }]
        }, false);
    }
}

//scale legend for smaller screens
function applyMobileLegendStyle(chart) {
    const width = chart.getWidth();
    const smallScreen = width > 700 && width <= 1200;;
    const mobileScreen = width <= 700;
    chart.setOption({
        legend: {
            bottom: 0,
            icon: 'rect',
            left: 'center',
            itemWidth: 15,
            textStyle: {
                fontWeight: 'bold',
                fontSize: mobileScreen ? LEGEND_SCALE * 10 : smallScreen ? LEGEND_SCALE * 12 : LEGEND_SCALE * 18
            },
            itemHeight: mobileScreen ? LEGEND_SCALE * 7 : smallScreen ? LEGEND_SCALE * 10 : LEGEND_SCALE * 14,
            itemGap: mobileScreen ? LEGEND_SCALE * 12 : smallScreen ? LEGEND_SCALE * 18 : LEGEND_SCALE * 25,

        },
    }, false);
}

//function that collects wind data by hour and returns an average to smooth out differences
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
            } else {
                windAverages.push([new Date((loopCountStart + (0.5 * HOUR_IN_SECS)) * 1000), null]);
                gustMaxes.push([new Date((loopCountStart + (0.5 * HOUR_IN_SECS)) * 1000), null]);
            }
        }
        loopCountStart += HOUR_IN_SECS;
        loopCountEnd += HOUR_IN_SECS;
        count++;
    }

    return { windAverages, gustMaxes };
}

async function getForecastData(nodeId) {
    const forecastResponse = await fetch(`/api/database/forecast?node=${nodeId}`);
    if (!forecastResponse.ok) {
        console.log("Error getting forecast data")
        return null;
    }

    const forecastData = await forecastResponse.json()
    return forecastData;
}




