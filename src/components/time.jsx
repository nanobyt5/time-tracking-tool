import React, {useEffect, useState} from "react";
import {DatePicker, Select} from "antd";
import {FormLabel, Grid} from "@material-ui/core";
import DataGrid, {
  Column,
  Export,
  Grouping,
  GroupItem,
  Selection,
  Summary, TotalItem,
} from "devextreme-react/data-grid";
import * as XLSX from "xlsx";

import '../css/time.css';

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
    dataField: "teamMember",
    dataType: "string",
    toSort: false,
  },
  {
    dataField: "activity",
    dataType: "number",
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
  { value: "teamMember", label: "User" },
  { value: "sprint", label: "Sprint" }
];

const INITIAL_GROUP_BY = "activity";

function Time() {
  const [db, setDb] = useState([]);
  const [minDate, setMinDate] = useState(new Date());
  const [maxDate, setMaxDate] = useState(new Date());
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [team, setTeam] = useState([]);
  const [teamMember, setTeamMember] = useState([]);
  const [activity, setActivity] = useState([]);
  const [tags, setTags] = useState([]);
  const [groupBy, setGroupBy] = useState(INITIAL_GROUP_BY);
  const [columns, setColumns] = useState(COLUMNS);

  // process CSV data
  const processData = (dataString) => {
    const dataStringLines = dataString.split(/\r\n|\n/);
    const headers = dataStringLines[0].split(
      /,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/
    );

    const list = [];
    let tempStartDate = startDate;
    let tempEndDate = endDate;
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
          let date = new Date(obj["Date"]);

          if (date < tempStartDate) {
            tempStartDate = date;
          }

          if (date > tempEndDate) {
            tempEndDate = date;
          }

          list.push(obj);
        }
      }
    }

    setMinDate(tempStartDate);
    setMaxDate(tempEndDate);

    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setDb(list);
  };

  // handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) {
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
      processData(data);
    };
    reader.readAsBinaryString(file);
  };

  const isEntryValid = (entry) => {
    const date = new Date(entry["Date"]);
    const entryTeam = entry["Team"];
    const user = entry["Team Member"];
    const entryActivity = entry["Activity"];
    const entryTags = entry["Tags"].split(",");

    if (!date || !entryTeam || !user || !entryActivity) {
      return false;
    }

    let dateFilter = date <= endDate && date >= startDate;
    let teamFilter = team.length === 0 || team.includes(entryTeam);
    let userFilter = teamMember.length === 0 || teamMember.includes(user);
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
          teamMember: entry["Team Member"],
          activity: entry["Activity"],
          hours: entry["Hours"],
          tags: entry["Tags"],
        });
      }
    });

    return tempData;
  };
  let data = getData();

  const changeTeam = (newTeams) => {
    setTeam(newTeams);
  };

  const changeTeamMembers = (newUsers) => {
    setTeamMember(newUsers);
  };

  const changeActivities = (newActivities) => {
    setActivity(newActivities);
  };

  const changeDate = (entries) => {
    if (entries === null) {
      return;
    }
    let dates = entries.map((entry) => entry["_d"]);
    setStartDate(dates[0]);
    setEndDate(dates[1]);
  };

  const changeTags = (newTags) => {
    setTags(newTags);
  };

  const changeGroupBy = (newGroupBy) => {
    setGroupBy(newGroupBy);
  };

  const getAllFromDb = (toGet) => {
    const lookUp = {};
    const toGets = [];

    db.forEach((entry) => {
      const entryElement = entry[toGet];

      if (!(entryElement in lookUp)) {
        toGets.push(entryElement);
        lookUp[entryElement] = 1;
      }
    });

    return toGets.sort();
  };

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

  const allTeams = getAllFromDb("Team");
  const allTeamMembers = getAllFromDb("Team Member");
  const allActivities = getAllFromDb("Activity");
  const allTags = getAllTags();

  useEffect(() => {
    const newCols = [...columns];
    newCols.forEach((column) => {
      column["toGroup"] = groupBy === column["dataField"];
    });

    setColumns(newCols);
  }, [groupBy]);

  const selectMultiComponent = (
    labelText,
    selectName,
    options,
    onChange
  ) => (
    <div className='selectMultiComponent'>
      <FormLabel style={{ fontWeight: 'bold' }}>{labelText}</FormLabel>
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

  const selectSingleComponent = (
    labelText,
    selectName,
    options,
    onChange
  ) => (
    <div className='selectSingleComponent' >
      <FormLabel style={{ margin: 5 }}>{labelText}</FormLabel>
      <Select value={selectName} onChange={onChange} size="medium" style={{ width: '60%' }}>
        {options.map((option) => (
          <Option value={option["value"]}>{option["label"]}</Option>
        ))}
      </Select>
    </div>
  );

  const uploadFileComponent = () => (
      <div className='uploadFileComponent' >
        <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileUpload}
        />
      </div>
  );

  const checkDate = (date) => {
    return date < moment(minDate) || date > moment(maxDate);
  }

  const datePickerRow = () => (
    <div className='datePickerRow'>
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
          showInGroupFooter={true}
        />
        <TotalItem
          column="hours"
          summaryType="sum"
          displayFormat="Total: {0}"
        />
      </Summary>

      <Export enabled={true} />
    </DataGrid>
  );

  const firstRowComponent = () => (
      <Grid container className='firstRow'>
        {uploadFileComponent()}
        {datePickerRow()}
        {selectSingleComponent(
            "Group By:",
            groupBy,
            GROUP_METHODS,
            changeGroupBy
        )}
      </Grid>
  )

  const secondRowComponent = () => (
      <Grid container justify={"space-between"} className='secondRow'>
        {selectMultiComponent(
            "Team:",
            team,
            allTeams,
            changeTeam
        )}
        {selectMultiComponent(
            "Team Member:",
            teamMember,
            allTeamMembers,
            changeTeamMembers
        )}
        {selectMultiComponent(
            "Activity:",
            activity,
            allActivities,
            changeActivities
        )}
        {selectMultiComponent(
            "Tags:",
            tags,
            allTags,
            changeTags
        )}
      </Grid>
  )

  return (
      <div>
        <Grid container justify={"space-evenly"}>
          <div className='tableWithForms'>
            {firstRowComponent()}
            {secondRowComponent()}
            {dataGridComponent()}
          </div>
          <div className="donutChart">
            <TimeChart
              data={data}
              groupBy={groupBy}
            />
          </div>
        </Grid>
      </div>
  );
}

export default Time;
