import React from "react";
import {Bar, Doughnut, Line} from "react-chartjs-2";
import randomColor from "randomcolor";

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
            chartData.push(lookUp[label]);
        })
    }

    getChartData();

    const createColours = () => {
        let arr = [...labels];
        return arr.map(() => randomColor());
    }

    const state = {
        labels: labels,
        datasets: [
            {
                label: 'Chart',
                backgroundColor: createColours(),
                data: chartData
            }
        ]
    }

    const getChart = () => {
        switch (chartType) {
            case "bar":
                return (
                    <Bar
                        data={state}
                        type={'bar'}
                    />
                )

            case "doughnut":
                return (
                    <Doughnut
                        data={state}
                        options={{
                            radius: 150,
                            height: 200,
                            maintainAspectRatio: false
                        }}
                        type={'doughnut'}
                    />
                );
        }
    };

    return(
        <div>
            <div className="chart" style={{ height:"80vh" }}>
                {getChart()}
            </div>
        </div>
    );
}

export default DonutChart;