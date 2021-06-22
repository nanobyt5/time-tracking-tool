import React from "react";
import {Column, Pie} from "@ant-design/charts";

function DonutChart(props) {
    let data = props.data;
    let groupBy = props.groupBy;
    let chartType = props.chartType;

    let labels = [];
    let chartData = [];
    const getChartData = () => {
        let lookUp = {};

        data.forEach(entry => {
            let label = entry[groupBy];
            let hours = entry["hours"];

            if (!(label in lookUp)) {
                lookUp[label] = parseInt(hours);
                labels.push(label);
            } else {
                lookUp[label] += parseInt(hours);
            }
        })

        labels.sort();

        labels.forEach(label => {
            chartData.push({
                type: label,
                value: lookUp[label]
            });
        })
    }

    getChartData();

    const capitalize = (word) => (
      word.slice(0, 1).toUpperCase() + word.slice(1, word.length)
    );

    let config = {
        appendPadding: 10,
        data: chartData,
        angleField: 'value',
        colorField: 'type',
        radius: 1,
        innerRadius: 0.6,
        label: {
            type: 'inner',
            offset: '-50%',
            content: function content(_ref) {
                let percent = _ref.percent;
                return ''.concat((percent * 100).toFixed(0), '%');
            },
            style: {
                textAlign: 'center',
                fontSize: 18,
            },
        },
        interactions: [{ type: 'element-selected' }, { type: 'element-active' }],
        statistic: {
            title: false,
            content: {
                style: {
                    whiteSpace: 'pre-wrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                },
                content: capitalize(groupBy) + '\nChart',
            },
        },
    };

    const getChart = () => {
        switch (chartType) {
            case "bar":
                return (
                    <Column
                        {...config}
                    />
                )

            case "doughnut":
                return (
                    <Pie
                        {...config}
                    />
                );
        }
    };

    return(
        <div>
            <div className="chart" style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                border: "solid black",
                height: "800px"
            }}>
                {getChart()}
            </div>
        </div>
    );
}

export default DonutChart;