document.addEventListener('DOMContentLoaded', () => {
    const chartDom = document.querySelector('.temperature-chart');
    const chart = echarts.init(chartDom);

    temperature = [18, 18, 17, 17, 17, 17, 17, 18, 19, 20, 21, 22, 22, 23, 23, 23, 24, 24, 23, 22, 21, 20, 19, 18];
    time = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 12, 22, 23];

    const option = {
        visualMap: {
            show: false,
            min: -5,
            max: 40,
            dimension: 1,
            inRange: {
                color: ["#524ed2", "#05a2a2", "#d8a100", "#c52f21"]
            }
        },
        xAxis: { type: 'category', data: time },
        yAxis: { type: 'value' },
        series: [{
            type: 'line',
            data: temperature.map((t, i) => [i, t]),
            smooth: true,
            lineStyle: {
                width: 3
            },
            symbol: 'none',
            areaStyle: {
                opacity: 0.35
            }
        }],
        tooltip: {
            trigger: 'axis',
            position: (pt) => [pt[0], '1%'],
        }

    }

    chart.setOption(option);

    window.addEventListener('resize', () => {
        chart.resize();
    });
});