import React, {useState} from "react";
import {DualAxes} from "@ant-design/charts";
import * as XLSX from "xlsx";
import DataGrid, {
    Column,
    Editing,
    Grouping,
    GroupItem,
    Selection, Summary
} from "devextreme-react/data-grid";

import '../css/sprintVelocityChart.css';

function SprintVelocityChart() {
    const [sprints, setSprints] = useState([]);
    const [barData, setBarData] = useState([]);
    const [lineData, setLineData] = useState([]);
    const [tableData, setTableData] = useState([]);

    const populateData = (lookUp, sprints) => {
        let barData = [];
        let lineData = [];
        let tableData = [];
        let i = 0;

        sprints.forEach(sprint => {
            let currSprint = lookUp[sprint];
            let totalCapacity = 0;
            let totalStoryPoints = 0;
            let j = 0;

            for (let name in currSprint) {
                let currMember = currSprint[name];
                let hours = currMember["hours"];
                let storyPoints = currMember["storyPoints"];
                let velocity = storyPoints / (hours / 8);

                totalCapacity += hours;
                totalStoryPoints += storyPoints;

                tableData.push({
                    id: `${i}.${j++}`,
                    name: name,
                    sprint: sprint,
                    capacity: hours,
                    storyPoints: storyPoints,
                    velocity: velocity
                })
            }

            let totalVelocity = totalStoryPoints / (totalCapacity / 8);

            barData.push(
                {
                    key: `${i}.1`,
                    sprint: sprint,
                    value: totalCapacity,
                    type: 'Capacity'
                },
                {
                    key: `${i}.2`,
                    sprint: sprint,
                    value: totalStoryPoints,
                    type: 'Completed Story Points'
                })

            lineData.push({
                key: i++,
                sprint: sprint,
                velocity: totalVelocity
            })
        })

        setTableData(tableData);
        setBarData(barData);
        setLineData(lineData);
    }

    const getChartData = (list) => {
        let lookUp = {};
        let sprints = [];

        list.filter(entry => entry["Team"] === "Tech Team" && entry["Story Points Completed"] !== "")
            .forEach(entry => {
                let sprint = entry["Sprint Cycle"];
                let hours = parseFloat(entry["Hours"]);
                let storyPoints = parseFloat(entry["Story Points Completed"]);
                let teamMember = entry["Team Member"];

                if (!(sprint in lookUp)) {
                    lookUp[sprint] = {};
                    lookUp[sprint][teamMember] = {
                        hours: hours,
                        storyPoints: storyPoints
                    };
                    sprints.push(sprint);
                } else {
                    let currSprint = lookUp[sprint];
                    if (!(teamMember in currSprint)) {
                        currSprint[teamMember] = {
                            hours: hours,
                            storyPoints: storyPoints
                        }
                    } else {
                        let currMember = currSprint[teamMember];
                        currMember["hours"] += hours;
                        currMember["storyPoints"] += storyPoints;
                    }
                }
            })

        sprints.sort();
        setSprints(sprints);

        populateData(lookUp, sprints);
    }

    const updateCharts = (lookUp) => {
        let newBarData = [];
        let newLineData = [];

        sprints.forEach(sprint => {
            let currSprint = lookUp[sprint];
            let capacity = currSprint['capacity'];
            let storyPoints = currSprint['storyPoints'];
            let velocity = storyPoints / (capacity / 8);

            newBarData.push(
                {
                    sprint: sprint,
                    value: capacity,
                    type: 'Capacity'
                },
                {
                    sprint: sprint,
                    value: storyPoints,
                    type: 'Completed Story Points'
                })

            newLineData.push({
                sprint: sprint,
                velocity: velocity
            })
        })

        setBarData(newBarData);
        setLineData(newLineData);
    }

    const prepNewChartData = (newTableData) => {
        let lookUp = {};

        newTableData.forEach(entry => {
            let sprint = entry["sprint"];
            let capacity = entry["capacity"];
            let storyPoints = entry["storyPoints"];

            if (!(sprint in lookUp)) {
                lookUp[sprint] = {
                    capacity: capacity,
                    storyPoints: storyPoints
                }
            } else {
                let currSprint = lookUp[sprint];
                currSprint['capacity'] += capacity;
                currSprint['storyPoints'] += storyPoints;
            }
        })

        updateCharts(lookUp);
    }

    const updateTable = (dataToChange, edit) => {
        let newTableData = [...tableData];
        let index = newTableData.findIndex(item => item['id'] === dataToChange['id']);
        let oldData = newTableData[index];

        for (let key in edit) {
            dataToChange[key] = edit[key];
        }

        dataToChange['velocity'] = dataToChange['storyPoints'] / (dataToChange['capacity'] / 8);

        newTableData.splice(index, 1, { ...oldData, ...dataToChange })

        setTableData(newTableData);
        prepNewChartData(newTableData);
    }

    const updateChange = (changes) => {
        if (changes.length === 0) {
            return;
        }

        let dataToChange = changes[0]['key'];
        let edit = changes[0]['data'];

        updateTable(dataToChange, edit);
    };

    // process CSV data
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

        getChartData(list);
    }

    // handle file upload
    const handleFileUpload = e => {
        const file = e.target.files[0];
        if (!file) {
            return;
        }

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

    const calculateVelocity = (options) => {
        let process = options.summaryProcess;
        switch (process) {
            case "start":
                options.totalValue = {
                    capacity: 0,
                    storyPoints: 0,
                };
                break;

            case "calculate":
                let totalCapacity = options.totalValue.capacity;
                let currCapacity = options.value.capacity;
                let totalStoryPoints = options.totalValue.storyPoints;
                let currStoryPoints = options.value.storyPoints;
                options.totalValue = {
                    capacity: totalCapacity + currCapacity,
                    storyPoints: totalStoryPoints + currStoryPoints
                }
                break;

            case "finalize":
                let finalStoryPoints = options.totalValue.storyPoints;
                let finalCapacity = options.totalValue.capacity / 8;
                options.totalValue = finalStoryPoints / finalCapacity
        }
    }

    let config = {
        data: [barData, lineData],
        xField: 'sprint',
        yField: ['value', 'velocity'],
        yAxis: {
          velocity: {
              min: 0,
              max: 5
          }
        },
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
        legend: {
            layout: 'horizontal',
            position: 'bottom'
        },
        height: 600,
    };

    const UploadFileComponent = () => (
        <div className= 'uploadFileComponent'>
            <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
            />
        </div>
    );

    const titleComponent = () => (
      <div className= 'titleComponent' >
          <h2>Sprint Velocity</h2>
          {UploadFileComponent()}
      </div>
    );

    const multiAxesComponent = () => (
        <div className="chart">
            <DualAxes
                {...config}
            />
        </div>
    );

    const dataGridComponent = () => (
        <div className= 'dataGrid'>
            <DataGrid
                id= 'gridContainer'
                dataSource={tableData}
                showBorders={true}
            >
                <Selection mode='single' />
                <Grouping autoExpandAll={true} />
                <Editing
                    mode= 'cell'
                    onChangesChange={updateChange}
                    allowUpdating={true}
                />

                <Column dataField= 'sprint' caption= 'Sprint' groupIndex={0} />
                <Column dataField= 'name' />
                <Column dataField= 'capacity' caption= "Capacity (hrs)"/>
                <Column dataField= 'storyPoints' caption= 'Story Points' />
                <Column dataField= 'velocity (SP / day)' />

                <Summary calculateCustomSummary={calculateVelocity}>
                    <GroupItem
                        column= "capacity"
                        summaryType= "sum"
                        displayFormat= "Capacity: {0}"
                        alignByColumn={true}
                    />
                    <GroupItem
                        column= "storyPoints"
                        summaryType= "sum"
                        displayFormat= "Story Points: {0}"
                        alignByColumn={true}
                    />
                    <GroupItem
                        summaryType= "custom"
                        displayFormat= "Sprint Velocity: {0}"
                        alignByColumn={true}
                        showInColumn= 'velocity'
                    />
                </Summary>
            </DataGrid>
        </div>
    )

    return (
        <div>
            {titleComponent()}
            <div className= "tableAndChart">
                {dataGridComponent()}
                {multiAxesComponent()}
            </div>
        </div>
    )
}

export default SprintVelocityChart;