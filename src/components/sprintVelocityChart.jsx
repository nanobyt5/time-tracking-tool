import React, { useEffect, useState } from "react";
import FileSaver from "file-saver";
import { observer } from "mobx-react";
import { DualAxes } from "@ant-design/charts";
import StateStore from "../stores/stateStore";
import DataGrid, {
  Column,
  Editing,
  Grouping,
  GroupItem,
  Selection,
  Summary,
} from "devextreme-react/data-grid";

import "../css/sprintVelocityChart.css";
import {Button, Form, Input, Modal} from "antd";
import * as XLSX from "xlsx";

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
  const [exportButtonVisibility, setExportButtonVisibility] = useState(false);

  const convertJsonToCsv = (json) => {
    let fields = Object.keys(json[0]);
    const replacer = (key, value) => (value === null ? '' : value);
    let csv = json.map(row => (
        fields.map(field => (
            JSON.stringify(row[field], replacer)
        )).join(',')
    ))
    csv.unshift(fields.join(','));
    csv = csv.join('\r\n');
    return csv;
  }

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

      Object.keys(currSprint).forEach(name => {
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
      })

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

    Object.keys(edit).forEach(key => {
      dataToChange[key] = edit[key];
    })

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

  const onExport = (values) => {
    if (tableData.length === 0) {
      return;
    }

    let csvToExport = convertJsonToCsv(tableData);
    let exportFileName = values["exportFileName"] + '.csv';
    let blob = new Blob([csvToExport], {
      type: "",
    })
    FileSaver.saveAs(blob, exportFileName);
    setExportButtonVisibility(false);
  }

  /**
   * Handles the data selected by the user to be shown in the page.
   */
  const processJsonToTable = () => {
    let content = [];
    StateStore.jsonFiles.forEach((json) =>
      content.push(JSON.parse(json["content"]))
    );
    getData(content.flat());
  };

  useEffect(() => {
    processJsonToTable();
  }, [StateStore.jsonFiles.length]);

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

  const updateChartWithImportData = (importedData, sprints) => {
    let newBarData = [];
    let newLineData = [];

    sprints.forEach(sprint => {
      let currSprint = importedData[sprint];
      let capacity = currSprint["capacity"];
      let storyPoints = currSprint["storyPoints"];
      let velocity = storyPoints / (capacity / HOURS_PER_DAY);

      newBarData.push(
          {
            sprint: sprint,
            value: capacity,
            type: "Capacity"
          },
          {
            sprint: sprint,
            value: storyPoints,
            type: "Completed Story Points"
          }
      );

      newLineData.push(
          {
            sprint: sprint,
            velocity: velocity
          }
      );
    });

    setBarData(newBarData);
    setLineData(newLineData);
  }

  const getChartDataFromImport = (importedData, sprints) => {
    let lookUp = {};

    importedData.forEach(entry => {
      let sprint = entry["sprint"];
      let capacity = entry["capacity"];
      let storyPoints = entry["storyPoints"];

      if (!(sprint in lookUp)) {
        lookUp[sprint] = {
          capacity: capacity,
          storyPoints: storyPoints
        };
      } else {
        let currSprint = lookUp[sprint];
        currSprint["capacity"] += capacity;
        currSprint["storyPoints"] += storyPoints;
      }
    });

    updateChartWithImportData(lookUp, sprints);
  }

  const convertCsvToJson = (dataString) => {
    if (!dataString) {
      return;
    }

    const dataStringLines = dataString.split(/\r\n|\n/);
    const headers = dataStringLines[0].split(
        /,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/
    );
    const importData = [];
    let sprintLookUp = {};
    let sprints = [];

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
          let sprint = obj["sprint"];
          if (!(sprint in sprintLookUp)) {
            sprints.push(sprint);
            sprintLookUp[sprint] = 1;
          }

          obj["capacity"] = parseFloat(obj["capacity"]);
          obj["storyPoints"] = parseFloat(obj["storyPoints"]);
          obj["velocity"] = parseFloat(obj["velocity"]);

          importData.push(obj);
        }
      }
    }
    sprints.sort();

    setSprints(sprints);
    setTableData(importData);
    getChartDataFromImport(importData, sprints);
  }

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

  const onImport = (file) => {
    let importedFile = file.target.files[0];

    if (!importedFile) {
      return;
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
      convertCsvToJson(data);
    };
    reader.readAsBinaryString(importedFile);
  }

  const ExportForm = () => {
    const [form] = Form.useForm();
    return (
        <Modal
          visible={exportButtonVisibility}
          title="Exporting the sprint velocity file"
          okText="Export"
          cancelText="Cancel"
          onCancel={() => setExportButtonVisibility(false)}
          onOk={() => {
            form
                .validateFields()
                .then((values) => {
                  form.resetFields();
                  onExport(values);
                })
                .catch((error) => {
                  console.log("Export Failed:", error);
                })
          }}
        >
          <Form
            form={form}
            layout="vertical"
            name="export_form"
          >
            <Form.Item
              name="exportFileName"
              label="Name of Export File"
              rules={[
                {
                  required: true,
                  message: "Please input the name of the export file!",
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Form>
        </Modal>
    )
  }

  const importExportComponents = () => (
      <div className="importAndExport">
        <div className="importButton">
          <Input
              type="file"
              size="small"
              onChange={onImport}
          />
        </div>
        <div className="exportButton">
          <Button
              size="medium"
              onClick={() => {setExportButtonVisibility(true)}}
          >
            Export
          </Button>
          {ExportForm()}
        </div>
      </div>
  )

  const titleComponent = () => (
    <div className="titleComponent">
      <h2>Sprint Velocity</h2>
      {importExportComponents()}
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
