import React, {useState} from "react";
import DataGrid, {Column, Scrolling} from "devextreme-react/data-grid";
import * as XLSX from "xlsx";
import {DualAxes} from "@ant-design/charts";

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
    const [data, setData] = useState(props.data);

    let sprints = [];
    let barData = [];
    let lineData = [];
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

            barData.push(
                {
                    sprint: sprint,
                    value: estimate,
                    type: 'Estimate'
                },
                {
                    sprint: sprint,
                    value: actual,
                    type: 'Actual Time Spent'
                })

            lineData.push({
                sprint: sprint,
                velocity: velocity
            })

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

    let config = {
        data: [barData, lineData],
        xField: 'sprint',
        yField: ['value', 'velocity'],
        geometryOptions: [
            {
                geometry: 'column',
                isGroup: true,
                seriesField: 'type',
            },
            {
                geometry: 'line',
                lineStyle: { lineWidth: 2 },
            },
        ],
    };

    const titleComponent = () => (
      <div style={{ margin:"5px", display:"flex", justifyContent:"space-between", width:"700px" }}>
          <h2>Sprint Velocity</h2>
      </div>
    );


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
        </div>
    );

    const multiAxesComponent = () => (
        <div className="chart" style={{ width:"60%", height:"500px" }}>
            <DualAxes
                {...config}
            />
        </div>
    );

    return (
        <div>
            {titleComponent()}
            <div style={{ display:"flex", justifyContent:"space-evenly", margin:"5px" }}>
                {dataGridComponent()}
                {multiAxesComponent()}
            </div>
        </div>
    )
}

export default SprintVelocityChart;