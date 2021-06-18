import React from "react";
import {Bar, Line} from "react-chartjs-2";
import DataGrid, {Column, Scrolling} from "devextreme-react/data-grid";
import {Button} from "@material-ui/core";

const COLUMNS = [
    {
        dataField: "sprint",
        dataType: "string",
        toGroup: true
    },
    {
        dataField: "capacity",
        dataType: "number",
        toGroup: false
    },
    {
        dataField: "storyPoints",
        dataType: "number",
        toGroup: false
    },
    {
        dataField: "sprintVelocity",
        dataType: "number",
        toGroup: false
    }
];

function SprintVelocityChart(props) {
    let data = props.db.filter(entry => entry["Team"] === "Tech Team");
    const [chartType, setChartType] = React.useState(true);

    const swapCharts = () => {
        setChartType(!chartType);
    };

    let sprints = [];
    let estimateHours = [];
    let actualHours = [];
    let sprintVelocity = [];
    let tableData = [];
    let maxHours = 0;
    let maxVelocity = 0;
    const populateData = (lookUp) => {
        sprints.forEach(sprint => {
            let currSprint = lookUp[sprint];
            let estimate = currSprint["estimate"];
            let actual = currSprint["actual"];
            let velocity = estimate / (actual / 4);

            if (velocity > maxVelocity) {
                maxVelocity = velocity;
            }

            if (estimate > maxHours) {
                maxHours = estimate;
            }

            if (actual > maxHours) {
                maxHours = actual;
            }
            estimateHours.push(estimate);
            actualHours.push(actual);
            sprintVelocity.push(velocity);

            tableData.push(
                {
                    sprint: sprint,
                    capacity: estimate,
                    storyPoints: actual,
                    sprintVelocity: velocity
                }
            )
        })
    }

    const getChartData = () => {
        let lookUp = {};
        data.forEach(entry => {
            let sprint = entry["Sprint"];
            let estimate = entry["Estimation"];
            let actual = entry["Hours"];

            if (!(sprint in lookUp)) {
                lookUp[sprint] = {
                    estimate: parseInt(estimate),
                    actual: parseInt(actual)
                };
                sprints.push(sprint);
            } else {
                let currEntry = lookUp[sprint];
                currEntry["estimate"] += parseInt(estimate);
                currEntry["actual"] += parseInt(actual);
                lookUp[sprint] = currEntry;
            }
        })

        sprints.sort();

        populateData(lookUp);
    }

    getChartData();

    const getDataSets = () => (
        chartType ?
            [
                {
                    type: 'line',
                    label: 'Sprint Velocity',
                    data: sprintVelocity,
                    yAxisID: 'line',
                    backgroundColor: "rgb(255,99,26)",
                    borderColor: "rgb(255,99,26)"
                },
                {
                    type: 'bar',
                    label: 'Estimated Hours',
                    data: estimateHours,
                    yAxisID: 'bar',
                    backgroundColor: "rgb(26,228,255)",
                    borderColor: "rgb(26,228,255)"
                },
                {
                    type: 'bar',
                    label: 'Actual Hours',
                    data:  actualHours,
                    yAxisID: 'bar',
                    backgroundColor: "rgb(26,83,255)",
                    borderColor: "rgb(26,83,255)"
                },
            ] :
            [
                {
                    type: 'line',
                    label: 'Estimated Hours',
                    data: estimateHours,
                    yAxisID: 'bar',
                    backgroundColor: "rgb(26,228,255)",
                    borderColor: "rgb(26,228,255)"
                },
                {
                    type: 'line',
                    label: 'Actual Hours',
                    data:  actualHours,
                    yAxisID: 'bar',
                    backgroundColor: "rgb(26,83,255)",
                    borderColor: "rgb(26,83,255)"
                },
                {
                    type: 'bar',
                    label: 'Sprint Velocity',
                    data: sprintVelocity,
                    yAxisID: 'line',
                    backgroundColor: "rgb(255,99,26)",
                    borderColor: "rgb(255,99,26)"
                }
            ]
    )

    const state = {
        labels: sprints,
        datasets: getDataSets()
    }

    const options = {
        scales: {
            line: {
                type: 'linear',
                display: true,
                position: 'right',
                max: maxVelocity + 1,
                ticks: {
                    stepSize: 1
                },
                grid: {
                    drawOnChartArea: false,
                },
            },
            bar: {
                type: 'linear',
                display: true,
                position: 'left',
                max: maxHours + 1,
                ticks: {
                    stepSize: 1
                }
            },
        },
        maintainAspectRatio:false
    };

    const dataGridComponent = () => (
        <div style={{ width:"39%", padding:"11px" }} >
            <DataGrid
                height={"30vh"}
                dataSource={tableData}
                showBorders={true}
                wordWrapEnabled={true}
            >
                <Scrolling mode={"infinite"} />

                {COLUMNS.map(({dataField, dataType, toGroup}) => (
                    toGroup ? (
                        <Column
                            dataField={dataField}
                            dataType={dataType}
                            alignment={"center"}
                            groupIndex={0}
                        />
                    ) : (
                        <Column
                            dataField={dataField}
                            dataType={dataType}
                            alignment={"center"}
                        />
                    )
                ))}
            </DataGrid>
            <Button
                variant="contained"
                color="primary"
                onClick={swapCharts}
            >
                Swap
            </Button>
        </div>
    );

    const barComponent = () => (
        <div className="chart" style={{ width:"60%", display:"flex", justifyContent:"center", height:"500px"}}>
            <Bar
                data={state}
                options={options}
                type={'bar'}
            />
        </div>
    );

    return (
        <div style={{ display:"flex", justifyContent:"space-evenly", margin:"5px" }}>
            {dataGridComponent()}
            {barComponent()}
        </div>
    )
}

export default SprintVelocityChart;