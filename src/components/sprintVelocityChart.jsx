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

function SprintVelocityChart() {
    const [data, setData] = useState([]);

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

    const processData = dataString => {
        const dataStringLines = dataString.split(/\r\n|\n/);
        const headers = dataStringLines[0].split(/,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/);

        const list = [];
        for (let i = 1; i < dataStringLines.length; i++) {
            const row = dataStringLines[i].split(/,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/);
            if (headers && row.length === headers.length) {
                const obj = {};
                for (let j = 0; j < headers.length; j++) {
                    let d = row[j];
                    if (d.length > 0) {
                        if (d[0] === '"')
                            d = d.substring(1, d.length - 1);
                        if (d[d.length - 1] === '"')
                            d = d.substring(d.length - 2, 1);
                    }
                    if (headers[j]) {
                        obj[headers[j]] = d;
                    }
                }

                // remove the blank rows
                if (Object.values(obj).filter(x => x).length > 0) {
                    list.push(obj);
                }
            }
        }

        setData(list);
    }

    // handle file upload
    const handleFileUpload = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (evt) => {
            /* Parse data */
            const bStr = evt.target.result;
            const wb = XLSX.read(bStr, { type: 'binary' });
            /* Get first worksheet */
            const wsName = wb.SheetNames[0];
            const ws = wb.Sheets[wsName];
            /* Convert array of arrays */
            const data = XLSX.utils.sheet_to_csv(ws, { header: 1 });
            processData(data);
        };
        reader.readAsBinaryString(file);
    }

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

    const uploadFileComponent = () => (
        <div style={{ display:"flex", justifyContent:"flex-end" }}>
            <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
            />
        </div>
    );

    const titleComponent = () => (
      <div style={{ margin:"5px", display:"flex", justifyContent:"space-between", width:"700px" }}>
          <h2>Sprint Velocity</h2>
          {uploadFileComponent()}
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