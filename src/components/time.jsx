import React, { useEffect, useState } from "react";
import { observer } from "mobx-react";
import { DatePicker, Select } from "antd";
import { FormLabel, Grid } from "@material-ui/core";
import DataGrid, {
  Column,
  Export,
  Grouping,
  GroupItem,
  Selection,
  Summary,
  TotalItem,
} from "devextreme-react/data-grid";

import ExcelStore from "../stores/excelStore";
import * as XLSX from "xlsx";

import "../css/time.css";

import TimeChart from "./timeChart";
import moment from "moment";

const { RangePicker } = DatePicker;
const { Option } = Select;

const COLUMNS = [
  {
    dataField: "date",
    dataType: "date",
    toSort: false,
  },
  {
    dataField: "sprint",
    dataType: "string",
    toSort: false,
  },
  {
    dataField: "team",
    dataType: "string",
    toSort: false,
  },
  {
    dataField: "member",
    dataType: "string",
    toSort: false,
  },
  {
    dataField: "activity",
    dataType: "string",
    toSort: false,
  },
  {
    dataField: "tags",
    dataType: "string",
    toSort: false,
  },
  {
    dataField: "hours",
    dataType: "number",
    toSort: false,
  },
];

const GROUP_METHODS = [
  { value: "", label: "All" },
  { value: "activity", label: "Activity" },
  { value: "tags", label: "Tags" },
  { value: "team", label: "Team" },
  { value: "member", label: "Member" },
  { value: "sprint", label: "Sprint" },
];

const INITIAL_GROUP_BY = "activity";

/**
 * Creates the time spent per activity page. It has states: db, minDate, maxDate, startDate, endDate,
 * team, member, activity, tags, groupBy, columns.
 */
function Time() {
  const [db, setDb] = useState([]);
  const [minDate, setMinDate] = useState(new Date());
  const [maxDate, setMaxDate] = useState(new Date());
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [team, setTeam] = useState([]);
  const [member, setMember] = useState([]);
  const [activity, setActivity] = useState([]);
  const [tags, setTags] = useState([]);
  const [groupBy, setGroupBy] = useState(INITIAL_GROUP_BY);
  const [columns, setColumns] = useState(COLUMNS);

  /**
   * Converts csv file to JSON and use the data for db, min, max, start, end dates.
   * credit: https://www.cluemediator.com/read-csv-file-in-react
   */
  const processData = (dataString) => {
    // if (!dataString) {
    //   return;
    // }
    // const dataStringLines = dataString.split(/\r\n|\n/);
    // const headers = dataStringLines[0].split(
    //   /,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/
    // );
    //
    // const list = [];
    // let tempStartDate = startDate;
    // let tempEndDate = endDate;
    // for (let i = 1; i < dataStringLines.length; i++) {
    //   const row = dataStringLines[i].split(
    //     /,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/
    //   );
    //   if (headers && row.length === headers.length) {
    //     const obj = {};
    //     for (let j = 0; j < headers.length; j++) {
    //       let d = row[j];
    //       if (d.length > 0) {
    //         if (d[0] === '"') d = d.substring(1, d.length - 1);
    //         if (d[d.length - 1] === '"') d = d.substring(d.length - 2, 1);
    //       }
    //       if (headers[j]) {
    //         obj[headers[j]] = d;
    //       }
    //     }
    //
    //     // remove the blank rows
    //     if (Object.values(obj).filter((x) => x).length > 0) {
    //       let date = new Date(obj["Date"]);
    //
    //       if (date < tempStartDate) {
    //         tempStartDate = date;
    //       }
    //
    //       if (date > tempEndDate) {
    //         tempEndDate = date;
    //       }
    //
    //       list.push(obj);
    //     }
    //   }
    // }
    let tempStartDate = startDate;
    let tempEndDate = endDate;

    dataString.forEach(entry => {
      let date = new Date(entry["Date"]);
      if (date < tempStartDate) {
        tempStartDate = date;
      }

      if (date > tempEndDate) {
        tempEndDate = date;
      }
    })

    setMinDate(tempStartDate);
    setMaxDate(tempEndDate);

    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setDb(dataString);
  };

  /**
   * Handles the csv file uploaded.
   * credit: https://www.cluemediator.com/read-csv-file-in-react
   */
  const handleFileUpload = () => {
    if (ExcelStore.excelFiles.length === 0) {
      return;
    }

    let content = [];
    ExcelStore.excelFiles.forEach(json => content.push(JSON.parse(json['content'])));
    processData(content.flat());

    // if (ExcelStore.excelFiles.length > 0) {
    //   file = ExcelStore.excelFiles[0];
    // }
    //
    // const reader = new FileReader();
    // reader.onload = (evt) => {
    //   /* Parse data */
    //   const bStr = evt.target.result;
    //   const wb = XLSX.read(bStr, { type: "binary" });
    //   /* Get first worksheet */
    //   const wsName = wb.SheetNames[0];
    //   const ws = wb.Sheets[wsName];
    //   /* Convert array of arrays */
    //   const data = XLSX.utils.sheet_to_csv(ws, { header: 1 });
    //   processData(data);
    // };
    // reader.readAsBinaryString(file);
  };

  useEffect(() => {
    handleFileUpload();
  }, [ExcelStore.excelFiles.length]);

  /**
   * Checks the entry from db on whether it should be part of the data used.
   */
  const isEntryValid = (entry) => {
    const date = new Date(entry["Date"]);
    const entryTeam = entry["Team"];
    const user = entry["Member"];
    const entryActivity = entry["Activity"];
    const entryTags = entry["Tags"].split(",");

    if (!date || !entryTeam || !user || !entryActivity) {
      return false;
    }

    let dateFilter = date <= endDate && date >= startDate;
    let teamFilter = team.length === 0 || team.includes(entryTeam);
    let userFilter = member.length === 0 || member.includes(user);
    let activityFilter =
      activity.length === 0 || activity.includes(entryActivity);
    let tagsFilter = tags.length === 0;

    for (let t of entryTags) {
      if (tags.includes(t.trim())) {
        tagsFilter = true;
        break;
      }
    }

    return (
      dateFilter && activityFilter && tagsFilter && userFilter && teamFilter
    );
  };

  /**
   * Gets the relevant data from the db for the charts and table.
   */
  const getData = () => {
    let i = 1;
    let tempData = [];
    db.forEach((entry) => {
      if (isEntryValid(entry)) {
        tempData.push({
          id: i++,
          date: new Date(entry["Date"]),
          sprint: entry["Sprint Cycle"],
          team: entry["Team"],
          member: entry["Member"],
          activity: entry["Activity"],
          hours: entry["Hours"],
          tags: entry["Tags"],
        });
      }
    });

    return tempData;
  };
  let data = getData();

  /**
   * Updates filters with the new teams.
   */
  const changeTeam = (newTeams) => {
    setTeam(newTeams);
  };

  /**
   * Updates filters with the new team members.
   */
  const changeMember = (newUsers) => {
    setMember(newUsers);
  };

  /**
   * Updates filters with the new activities.
   */
  const changeActivities = (newActivities) => {
    setActivity(newActivities);
  };

  /**
   * Updates filters with the new dates.
   */
  const changeDate = (entries) => {
    if (entries === null) {
      return;
    }
    let dates = entries.map((entry) => entry["_d"]);
    setStartDate(dates[0]);
    setEndDate(dates[1]);
  };

  /**
   * Updates filters with the new tags.
   */
  const changeTags = (newTags) => {
    setTags(newTags);
  };

  /**
   * Updates with new group by option.
   */
  const changeGroupBy = (newGroupBy) => {
    setGroupBy(newGroupBy);
  };

  /**
   * Gets all distinct entries based on the toGet field.
   */
  const getAllFromDb = (toGet) => {
    const lookUp = {};
    const toGets = [];

    db.forEach((entry) => {
      const entryElement = entry[toGet];

      if (!(entryElement in lookUp)) {
        if (entryElement !== "") {
          toGets.push(entryElement);
          lookUp[entryElement] = 1;
        }
      }
    });

    return toGets.sort();
  };

  /**
   * Gets all distinct tags from db.
   */
  const getAllTags = () => {
    const lookUp = {};
    const tags = [];

    db.forEach((entry) => {
      const tagsFromEntry = entry["Tags"];
      tagsFromEntry.split(",").forEach((tag) => {
        tag = tag.trim();
        if (tag === "") {
          return;
        }

        if (!(tag in lookUp)) {
          tags.push(tag);
          lookUp[tag] = 1;
        }
      });
    });

    return tags.sort();
  };

  /**
   * Checks whether the date inputted is in between the min and max dates.
   */
  const checkDate = (date) => {
    return date < moment(minDate) || date > moment(maxDate);
  };

  const allTeams = getAllFromDb("Team");
  const allMembers = getAllFromDb("Member");
  const allActivities = getAllFromDb("Activity");
  const allTags = getAllTags();

  useEffect(() => {
    const newCols = [...columns];
    newCols.forEach((column) => {
      column["toGroup"] = groupBy === column["dataField"];
    });

    setColumns(newCols);
  }, [groupBy]);

  const selectMultiComponent = (labelText, selectName, options, onChange) => (
    <div className="selectMultiComponent">
      <FormLabel style={{ fontWeight: "bold" }}>{labelText}</FormLabel>
      <Select
        mode="multiple"
        allowClear
        placeholder="No filter"
        style={{ width: "100%" }}
        value={selectName}
        onChange={onChange}
        tokenSeparators={[","]}
      >
        {options.map((option) => (
          <Option value={option}>{option}</Option>
        ))}
      </Select>
    </div>
  );

  const selectSingleComponent = (labelText, selectName, options, onChange) => (
    <div className="selectSingleComponent">
      <FormLabel style={{ margin: 5 }}>{labelText}</FormLabel>
      <Select
        value={selectName}
        onChange={onChange}
        size="medium"
        style={{ width: "60%" }}
      >
        {options.map((option) => (
          <Option value={option["value"]}>{option["label"]}</Option>
        ))}
      </Select>
    </div>
  );

  // const uploadFileComponent = () => (
  //     <div className='uploadFileComponent' >
  //       <input
  //           type="file"
  //           accept=".csv,.xlsx,.xls"
  //           onChange={handleFileUpload}
  //       />
  //     </div>
  // );

  const datePickerRow = () => (
    <div className="datePickerRow">
      <RangePicker
        value={[moment(startDate), moment(endDate)]}
        onChange={changeDate}
        disabledDate={checkDate}
      />
    </div>
  );

  const dataGridComponent = () => (
    <DataGrid
      height={"56vh"}
      dataSource={data}
      showBorders={true}
      wordWrapEnabled={true}
      style={{ margin: 5 }}
    >
      <Grouping autoExpandAll={true} texts={{ groupByThisColumn: groupBy }} />
      <Selection mode={"single"} />

      {columns.map(({ toGroup, dataField, dataType }) =>
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
      )}

      <Summary>
        <GroupItem
          column="hours"
          summaryType="sum"
          displayFormat="Total Hours: {0}"
          valueFormat="#.###"
          showInGroupFooter={true}
        />
        <TotalItem
          column="hours"
          summaryType="sum"
          displayFormat="Total: {0}"
          valueFormat="#.###"
        />
      </Summary>

      <Export enabled={true} />
    </DataGrid>
  );

  const firstRowComponent = () => (
    <Grid container className="firstRow">
      {datePickerRow()}
      {selectSingleComponent(
        "Group By:",
        groupBy,
        GROUP_METHODS,
        changeGroupBy
      )}
    </Grid>
  );

  const secondRowComponent = () => (
    <Grid container justify={"space-between"} className="secondRow">
      {selectMultiComponent("Team:", team, allTeams, changeTeam)}
      {selectMultiComponent("Member:", member, allMembers, changeMember)}
      {selectMultiComponent(
        "Activity:",
        activity,
        allActivities,
        changeActivities
      )}
      {selectMultiComponent("Tags:", tags, allTags, changeTags)}
    </Grid>
  );

  return (
    <div>
      <Grid container justify={"space-evenly"}>
        <div className="tableWithForms">
          {firstRowComponent()}
          {secondRowComponent()}
          {dataGridComponent()}
        </div>
        <div className="donutChart">
          <TimeChart data={data} groupBy={groupBy} />
        </div>
      </Grid>
    </div>
  );
}

export default observer(Time);
