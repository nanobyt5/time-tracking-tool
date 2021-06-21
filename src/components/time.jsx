import React, {useEffect, useState} from "react";
import DatePicker from "react-datepicker";
import {FormLabel, Grid} from "@material-ui/core";
import Select from "react-select";
import {subDays} from "date-fns";
import DataGrid, {
  Column,
  Export,
  Grouping,
  GroupItem,
  Scrolling,
  Selection,
  Summary
} from "devextreme-react/data-grid";

import "react-datepicker/dist/react-datepicker.css";

import DonutChart from "./donutChart";

const COLUMNS = [
  {
    dataField: "id",
    dataType: "number",
    toGroup: false,
  },
  {
    dataField: "date",
    dataType: "date",
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
  }
];

const GROUP_METHODS = [
  { value: "", label: "All" },
  { value: "activity", label: "Activity" },
  { value: "tags", label: "Tags" },
  { value: "team", label: "Team" },
  { value: "teamMember", label: "User" },
];

const CHART_TYPES = [
  { value: "bar", label: "Bar Chart" },
  { value: "doughnut", label: "Doughnut Chart" },
];

const INITIAL_GROUP_BY = "activity";

const INITIAL_CHART_TYPE = "doughnut";

function Time(props) {
  const db = props.db;
  const [startDate, setStartDate] = useState(subDays(new Date(), 6));
  const [endDate, setEndDate] = useState(new Date());
  const [team, setTeam] = useState([]);
  const [teamMember, setTeamMember] = useState([]);
  const [activity, setActivity] = useState([]);
  const [tags, setTags] = useState([]);
  const [groupBy, setGroupBy] = useState(INITIAL_GROUP_BY);
  const [chartType, setChartType] = useState(INITIAL_CHART_TYPE)
  const [columns, setColumns] = useState(COLUMNS);

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

  let data = [];
  let i = 1;
  db.forEach((entry) => {
    if (isEntryValid(entry)) {
      data.push({
        id: i++,
        date: new Date(entry["Date"]),
        team: entry["Team"],
        teamMember: entry["Team Member"],
        activity: entry["Activity"],
        hours: entry["Hours"],
        tags: entry["Tags"],
      });
    }
  });

  const changeStartDate = (date) => {
    setStartDate(date);
  };

  const changeEndDate = (date) => {
    setEndDate(date);
  };

  const changeTeam = (entries) => {
    let teams = entries.map(({ value }) => value);
    setTeam(teams);
  };

  const changeTeamMembers = (entries) => {
    let users = entries.map((entry) => entry.value);
    setTeamMember(users);
  };

  const changeActivities = (entries) => {
    let activities = entries.map(({ value }) => value);
    setActivity(activities);
  };

  const changeTags = (entries) => {
    let tags = entries.map(({ value }) => value);
    setTags(tags);
  };

  const changeSortMethod = ({ value }) => {
    setGroupBy(value);
  };

  const changeChartType = ({ value }) => {
    setChartType(value);
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

    return toGets.sort().map(entry => (
        {
          value: entry,
          label: entry
        }
    ));
  };

  const getAllTags = () => {
    const lookUp = {};
    const tags = [];

    db.forEach((entry) => {
      const tagsFromEntry = entry["Tags"];
      tagsFromEntry.split(",").forEach(tag => {
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

    return tags.sort()
        .map(entry => ({
          value: entry,
          label: entry
        }));
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
      className,
      labelText,
      selectName,
      options,
      onChange
  ) => (
      <div className={className} style={{ width: 220 }}>
        <FormLabel>{labelText}</FormLabel>
        <Select
            isMulti
            names={selectName}
            options={options}
            onChange={onChange}
        />
      </div>
  );

  const selectSingleComponent = (
      className,
      labelText,
      selectName,
      options,
      onChange
  ) => (
      <div className={className} style={{ width: 220 }}>
        <FormLabel>{labelText}</FormLabel>
        <Select
            names={selectName}
            options={options}
            onChange={onChange}
        />
      </div>
  );

  const datePickerFormComponent = (
      className,
      labelText,
      selectedDate,
      startDate,
      endDate,
      onChange
  ) => (
      <div className={className}>
        <FormLabel>{labelText}</FormLabel>
        <DatePicker
            selected={selectedDate}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            onChange={onChange}
            dateFormat="dd/MM/yyyy"
        />
      </div>
  );

  const datePickerRow = () => (
      <Grid container justify={"space-evenly"} >
        {datePickerFormComponent(
            "startDateForm",
            "Start Date:",
            startDate,
            startDate,
            endDate,
            changeStartDate
        )}
        {datePickerFormComponent(
            "endDateForm",
            "End Date:",
            endDate,
            startDate,
            endDate,
            changeEndDate
        )}
      </Grid>
  );

  const selectComponentGrid = () => (
      <Grid container justify={"space-evenly"}>
        {selectMultiComponent(
            "teamForm",
            "Teams:",
            "teams",
            allTeams,
            changeTeam
        )}
        {selectMultiComponent(
            "userForm",
            "User:",
            "users",
            allTeamMembers,
            changeTeamMembers
        )}
        {selectMultiComponent(
            "activityForm",
            "Activity:",
            "activities",
            allActivities,
            changeActivities
        )}
        {selectMultiComponent("tagForm", "Tags:", "tags", allTags, changeTags)}
      </Grid>
  );

  const dataGridComponent = () => (
      <DataGrid
          height={"56vh"}
          dataSource={data}
          showBorders={true}
          wordWrapEnabled={true}
      >
        <Grouping autoExpandAll={true} texts={{ groupByThisColumn: groupBy }} />
        <Selection mode={"single"} />

        <Scrolling mode={"infinite"} />

        {columns.map(({ toGroup, dataField, dataType }) =>
            toGroup ? (
                <Column dataField={dataField} dataType={dataType} alignment={"center"} groupIndex={0} />
            ) : (
                <Column dataField={dataField} dataType={dataType} alignment={"center"} />
            )
        )}

        <Summary>
          <GroupItem
              column="hours"
              summaryType="sum"
              displayFormat="Total Hours: {0}"
              showInGroupFooter={true}
          />
        </Summary>

        <Export enabled={true} />
      </DataGrid>
  );

  const groupByForm = () => (
      <Grid container justify={"space-evenly"}>
        {selectSingleComponent(
            "sortForm",
            "Group By:",
            "groupBy",
            GROUP_METHODS,
            changeSortMethod
        )}
        {selectSingleComponent(
            "chartTypeForm",
            "Chart Type:",
            "chartType",
            CHART_TYPES,
            changeChartType
        )}
      </Grid>
  );

  const filterOptionsComponent = () => (
      <div>
        {datePickerRow()}
        {groupByForm()}
        {selectComponentGrid()}
      </div>
  );

  return (
      <Grid container justify={"space-evenly"} >
        <div style={{ width:"49%" }}>
          {filterOptionsComponent()}
          <div style={{ margin: "5px" }}>
            {dataGridComponent()}
          </div>
        </div>
        <div className="donutChart" style={{ width: "49%" }}>
          <DonutChart
              data={data}
              groupBy={groupBy}
              chartType={chartType}
              startDate={startDate}
              endDate={endDate}
          />
        </div>
      </Grid>
  );
}

export default Time;
