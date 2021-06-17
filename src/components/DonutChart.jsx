import React from "react";
import {Doughnut} from "react-chartjs-2";
import randomColor from "randomcolor";

function DonutChart(props) {
    let data = props.data;
    let groupBy = props.groupBy;

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
                label: 'Sorted By',
                backgroundColor: createColours(),
                data: chartData
            }
        ]
    }

    return(
        <div>
            <div className="chart" style={{ height:"500px", padding:"5px" }}>
                <Doughnut
                    data={state}
                    options={{
                        radius:150,
                        height:200,
                        maintainAspectRatio:false
                    }}
                    type={'doughnut'}
                />
            </div>
        </div>
    );
}

export default DonutChart;