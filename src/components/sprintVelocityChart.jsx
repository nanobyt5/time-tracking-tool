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

const COLUMNS = [
    {
        title: 'Sprint',
        dataIndex: 'sprint',
    },
    {
        title: 'Capacity',
        dataIndex: 'capacity',
        editable: true
    },
    {
        title: 'Completed',
        dataIndex: 'completed',
        editable: true
    },
    {
        title: 'Velocity',
        dataIndex: 'velocity',
    }
];

function SprintVelocityChart() {
    const [barData, setBarData] = useState([]);
    const [lineData, setLineData] = useState([]);
    const [tableData, setTableData] = useState([]);

    const saveNewBarData = (key, sprint, capacity, completed) => {
        const newBarData = [...barData];
        const timeIndex = newBarData.findIndex(item => key + '.1' === item.key);

        const timeItem = newBarData[timeIndex];
        const newTimeItem = {
            key: key + '.1',
            sprint: sprint,
            value: capacity,
            type: 'Capacity'
        };

        newBarData.splice(timeIndex, 1, { ...timeItem, ...newTimeItem });

        const storyIndex = newBarData.findIndex(item => key + '.2' === item.key);

        const storyItem = newBarData[storyIndex];
        const newStoryItem = {
            key: key + '.2',
            sprint: sprint,
            value: completed,
            type: 'Completed Story Points'
        };

        newBarData.splice(storyIndex, 1, { ...storyItem, ...newStoryItem });

        setBarData(newBarData);
    }

    const saveNewLineData = (key, sprint, velocity) => {
        const newLineData = [...lineData];
        const index = newLineData.findIndex(item => key === item.key);

        const item = newLineData[index];
        const newItem = {
            key: key,
            sprint: sprint,
            velocity: velocity
        };

        newLineData.splice(index, 1, { ...item, ...newItem });

        setLineData(newLineData);
    }

    const saveNewTableData = (key, sprint, capacity, completed, velocity) => {
        const newTableData = [...tableData];
        const index = newTableData.findIndex(item => key === item.key);

        const item = newTableData[index];
        const newItem = {
            key: key,
            sprint: sprint,
            capacity: capacity,
            completed: completed,
            velocity: velocity
        };

        newTableData.splice(index, 1, {...item, ...newItem});

        setTableData(newTableData);
    }

    const handleSave = ({ key, sprint, capacity, completed }) => {
        let capacityParse = parseFloat(capacity);
        let completedParse = parseFloat(completed);
        let velocity = completedParse / (capacityParse / 8);

        saveNewTableData(key, sprint, capacityParse, completedParse, velocity);
        saveNewBarData(key, sprint, capacityParse, completedParse);
        saveNewLineData(key, sprint, velocity);
    }

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

        populateData(lookUp, sprints);
    }

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

    COLUMNS.map(col => {
        if (!col.editable) {
            return col;
        }

        return {
            ...col,
            onCell: (record) => ({
                record,
                editable: col.editable,
                dataIndex: col.dataIndex,
                title: col.title,
                handleSave: handleSave,
            }),
        };
    });

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
        <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileUpload}
        />
    );

    const titleComponent = () => (
      <div style={{ margin:"5px", display:"flex", justifyContent:"space-between", width:"700px" }}>
          <h2>Sprint Velocity</h2>
          {UploadFileComponent()}
      </div>
    );

    const multiAxesComponent = () => (
        <div className="chart" style={{ width: "100%", height: "70vh" }}>
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
                    allowUpdating={true}
                />

                <Column dataField= 'sprint' caption= 'Sprint' groupIndex={0} />
                <Column dataField= 'name' />
                <Column dataField= 'capacity' />
                <Column dataField= 'storyPoints' caption= 'Completed Story Points' />
                <Column dataField= 'velocity' />

                <Summary calculateCustomSummary={calculateVelocity}>
                    <GroupItem
                        column= "capacity"
                        summaryType= "sum"
                        displayFormat= "Total Capacity: {0}"
                        alignByColumn={true}
                    />
                    <GroupItem
                        column= "storyPoints"
                        summaryType= "sum"
                        displayFormat= "Total Story Points: {0}"
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
            <div>
                {multiAxesComponent()}
                {dataGridComponent()}
            </div>
        </div>
    )
}

export default SprintVelocityChart;