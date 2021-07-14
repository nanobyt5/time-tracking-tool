import React, { useEffect, useState } from "react";
import { observer } from "mobx-react";
import { DualAxes } from "@ant-design/charts";
import ExcelStore from "../stores/excelStore";
import * as XLSX from "xlsx";
import DataGrid, {
  Column,
  Editing,
  Grouping,
  GroupItem,
  Selection,
  Summary,
} from "devextreme-react/data-grid";

import "../css/sprintVelocityChart.css";

const HOURS_PER_DAY = 8;

/**
 * Creates the sprint velocity page. It has states: sprints, data for bar, line charts, and table.
 * The data are initially empty arrays.
 */
function SprintVelocityChart() {
  const [sprints, setSprints] = useState([]);
  const [barData, setBarData] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [tableData, setTableData] = useState([]);

  /**
   * Takes in a sorted array of the sprints and data from `getData` and use them to populate the
   * data for the bar, line, and table to be shown.
   */
  const populateData = (lookUp, sprints) => {
    let barData = [];
    let lineData = [];
    let tableData = [];
    let i = 0;

    sprints.forEach((sprint) => {
      let currSprint = lookUp[sprint];
      let totalCapacity = 0;
      let totalStoryPoints = 0;
      let j = 0;

      for (let name in currSprint) {
        let currMember = currSprint[name];
        let hours = currMember["hours"];
        let storyPoints = currMember["storyPoints"];
        let velocity = storyPoints / (hours / HOURS_PER_DAY);

        totalCapacity += hours;
        totalStoryPoints += storyPoints;

        tableData.push({
          id: `${i}.${j++}`,
          name: name,
          sprint: sprint,
          capacity: hours,
          storyPoints: storyPoints,
          velocity: velocity,
        });
      }

      let totalVelocity = totalStoryPoints / (totalCapacity / HOURS_PER_DAY);

      barData.push(
        {
          key: `${i}.1`,
          sprint: sprint,
          value: totalCapacity,
          type: "Capacity",
        },
        {
          key: `${i}.2`,
          sprint: sprint,
          value: totalStoryPoints,
          type: "Completed Story Points",
        }
      );

      lineData.push({
        key: i++,
        sprint: sprint,
        velocity: totalVelocity,
      });
    });

    setTableData(tableData);
    setBarData(barData);
    setLineData(lineData);
  };

  /**
   * Takes in the data from the csv file and filters data from tech team with story point inputted.
   * The data is condensed to sprints and users with the cumulated hours and story points.
   */
  const getData = (list) => {
    let lookUp = {};
    let sprints = [];

    list
      .filter(
        (entry) =>
          entry["Team"].includes("Tech Team") && entry["Story Points"] !== ""
      )
      .forEach((entry) => {
        let sprint = entry["Sprint Cycle"];
        let hours = parseFloat(entry["Hours"]);
        let storyPoints = parseFloat(entry["Story Points"]);
        let member = entry["Member"];

        if (!(sprint in lookUp)) {
          lookUp[sprint] = {};
          lookUp[sprint][member] = {
            hours: hours,
            storyPoints: storyPoints,
          };
          sprints.push(sprint);
        } else {
          let currSprint = lookUp[sprint];
          if (!(member in currSprint)) {
            currSprint[member] = {
              hours: hours,
              storyPoints: storyPoints,
            };
          } else {
            let currMember = currSprint[member];
            currMember["hours"] += hours;
            currMember["storyPoints"] += storyPoints;
          }
        }
      });

    sprints.sort();
    setSprints(sprints);

    populateData(lookUp, sprints);
  };

  /**
   * Takes in the new data to populate the bar and line charts.
   */
  const updateCharts = (lookUp) => {
    let newBarData = [];
    let newLineData = [];

    sprints.forEach((sprint) => {
      let currSprint = lookUp[sprint];
      let capacity = currSprint["capacity"];
      let storyPoints = currSprint["storyPoints"];
      let velocity = storyPoints / (capacity / HOURS_PER_DAY);

      newBarData.push(
        {
          sprint: sprint,
          value: capacity,
          type: "Capacity",
        },
        {
          sprint: sprint,
          value: storyPoints,
          type: "Completed Story Points",
        }
      );

      newLineData.push({
        sprint: sprint,
        velocity: velocity,
      });
    });

    setBarData(newBarData);
    setLineData(newLineData);
  };

  /**
   * Takes in new table data and mutate it to suitable data for the charts.
   */
  const prepNewChartData = (newTableData) => {
    let lookUp = {};

    newTableData.forEach((entry) => {
      let sprint = entry["sprint"];
      let capacity = entry["capacity"];
      let storyPoints = entry["storyPoints"];

      if (!(sprint in lookUp)) {
        lookUp[sprint] = {
          capacity: capacity,
          storyPoints: storyPoints,
        };
      } else {
        let currSprint = lookUp[sprint];
        currSprint["capacity"] += capacity;
        currSprint["storyPoints"] += storyPoints;
      }
    });

    updateCharts(lookUp);
  };

  /**
   * Makes use of the relevant data to be changed and the new data, to create the new table data,
   * before updating the charts' data.
   */
  const updateTable = (dataToChange, edit) => {
    let newTableData = [...tableData];
    let index = newTableData.findIndex(
      (item) => item["id"] === dataToChange["id"]
    );
    let oldData = newTableData[index];

    for (let key in edit) {
      dataToChange[key] = edit[key];
    }

    dataToChange["velocity"] =
      dataToChange["storyPoints"] / (dataToChange["capacity"] / HOURS_PER_DAY);

    newTableData.splice(index, 1, { ...oldData, ...dataToChange });

    setTableData(newTableData);
    prepNewChartData(newTableData);
  };

  /**
   * Takes in the changes made in the edit on the sprint velocity table to update charts and table
   * data.
   */
  const updateChange = (changes) => {
    if (changes.length === 0) {
      return;
    }

    let dataToChange = changes[0]["key"];
    let edit = changes[0]["data"];

    updateTable(dataToChange, edit);
  };

  /**
   * Converts the csv file to JSON format and used the data for the charts and table.
   * credit: https://www.cluemediator.com/read-csv-file-in-react
   */
  const processData = (dataString) => {
    const dataStringLines = dataString.split(/\r\n|\n/);
    const headers = dataStringLines[0].split(
      /,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/
    );

    const list = [];
    for (let i = 1; i < dataStringLines.length; i++) {
      const row = dataStringLines[i].split(
        /,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/
      );
      if (headers && row.length === headers.length) {
        const obj = {};
        for (let j = 0; j < headers.length; j++) {
          let d = row[j];
          if (d.length > 0) {
            if (d[0] === '"') d = d.substring(1, d.length - 1);
            if (d[d.length - 1] === '"') d = d.substring(d.length - 2, 1);
          }
          if (headers[j]) {
            obj[headers[j]] = d;
          }
        }

        // remove the blank rows
        if (Object.values(obj).filter((x) => x).length > 0) {
          list.push(obj);
        }
      }
    }

    getData(list);
  };

  /**
   * Handles the csv file uploaded.
   * credit: https://www.cluemediator.com/read-csv-file-in-react
   */
  const handleFileUpload = () => {
    //const file = e.target.files[0]; // To be removed ///////////////////
    let file = new Blob();

    if (ExcelStore.excelFiles.length > 0) {
      file = ExcelStore.excelFiles[0];
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      /* Parse data */
      const bStr = evt.target.result;
      const wb = XLSX.read(bStr, { type: "binary" });
      /* Get first worksheet */
      const wsName = wb.SheetNames[0];
      const ws = wb.Sheets[wsName];
      /* Convert array of arrays */
      const data = XLSX.utils.sheet_to_csv(ws, { header: 1 });
      processData(data);
    };
    reader.readAsBinaryString(file);
  };

  useEffect(() => {
    handleFileUpload();
  }, [ExcelStore.excelFiles.length]);

  /**
   * Calculates the total sprint velocity in each sprint.
   */
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
          storyPoints: totalStoryPoints + currStoryPoints,
        };
        break;

      case "finalize":
        let finalStoryPoints = options.totalValue.storyPoints;
        let finalCapacity = options.totalValue.capacity / HOURS_PER_DAY;
        options.totalValue = finalStoryPoints / finalCapacity;
    }
  };

  /**
   * Config used for bar and line charts.
   */
  let config = {
    data: [barData, lineData],
    xField: "sprint",
    yField: ["value", "velocity"],
    yAxis: {
      velocity: {
        min: 0,
        max: 5,
      },
    },
    geometryOptions: [
      {
        geometry: "column",
        isGroup: true,
        seriesField: "type",
      },
      {
        geometry: "line",
        lineStyle: { lineWidth: 2 },
      },
    ],
    legend: {
      layout: "horizontal",
      position: "bottom",
    },
    height: 600,
  };

  // const UploadFileComponent = () => (
  //     <div className= 'uploadFileComponent'>
  //         <input
  //             type="file"
  //             accept=".csv,.xlsx,.xls"
  //             onChange={handleFileUpload}
  //         />
  //     </div>
  // );

  const titleComponent = () => (
    <div className="titleComponent">
      <h2>Sprint Velocity</h2>
    </div>
  );

  const multiAxesComponent = () => (
    <div className="chart">
      <DualAxes {...config} />
    </div>
  );

  const dataGridComponent = () => (
    <div className="dataGrid">
      <DataGrid id="gridContainer" dataSource={tableData} showBorders={true}>
        <Selection mode="single" />
        <Grouping autoExpandAll={true} />
        <Editing
          mode="cell"
          onChangesChange={updateChange}
          allowUpdating={true}
        />

        <Column dataField="sprint" caption="Sprint" groupIndex={0} />
        <Column dataField="name" />
        <Column dataField="capacity" caption="Capacity (hrs)" />
        <Column dataField="storyPoints" caption="Story Points" />
        <Column
          dataField="velocity"
          caption="Velocity (SP / day)"
          format="#.###"
        />

        <Summary calculateCustomSummary={calculateVelocity}>
          <GroupItem
            column="capacity"
            summaryType="sum"
            displayFormat="Capacity: {0}"
            alignByColumn={true}
          />
          <GroupItem
            column="storyPoints"
            summaryType="sum"
            displayFormat="Story Points: {0}"
            alignByColumn={true}
          />
          <GroupItem
            summaryType="custom"
            displayFormat="Sprint Velocity: {0}"
            valueFormat="#.###"
            alignByColumn={true}
            showInColumn="velocity"
          />
        </Summary>
      </DataGrid>
    </div>
  );

  return (
    <div>
      {titleComponent()}
      <div className="tableAndChart">
        {dataGridComponent()}
        {multiAxesComponent()}
      </div>
    </div>
  );
}

export default observer(SprintVelocityChart);
