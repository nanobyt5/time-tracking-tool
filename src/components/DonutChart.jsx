import React from "react";
import {Doughnut} from "react-chartjs-2";

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
                lookUp[label] = hours;
            } else {
                lookUp[label] += hours;
            }
        })

        for (let entry in lookUp) {
            labels.push(entry);
            chartData.push(lookUp[entry]);
        }
    }
    getChartData();

    const state = {
        labels: labels,
        datasets: [
            {
                label: 'Sorted By',
                backgroundColor: [
                    '#B21F00',
                    '#C9DE00',
                    '#2FDE00',
                    '#00A6B4',
                    '#6800B4'
                ],
                hoverBackgroundColor: [
                    '#501800',
                    '#4B5000',
                    '#175000',
                    '#003350',
                    '#35014F'
                ],
                data: chartData
            }
        ]
    }

    return(
        <div>
            <div className="chart" style={{height:"500px"}}>
                <Doughnut
                    data={state}
                    options={{
                        radius:150,
                        height:200,
                        title:{
                            display:false,
                            text:'Average Rainfall per month',
                            fontSize:20
                        },
                        legend:{
                            display:true,
                            position:'left'
                        },
                        maintainAspectRatio:false
                    }}
                    type={'doughnut'}
                />
            </div>
        </div>
    );
}

export default DonutChart;