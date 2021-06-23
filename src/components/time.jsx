import React, {useEffect, useState} from "react";
import { DatePicker } from "antd";
import {FormLabel, Grid} from "@material-ui/core";
import { Select } from "antd";
import DataGrid, {
  Column,
  Export,
  Grouping,
  GroupItem,
  Scrolling,
  Selection,
  Summary
} from "devextreme-react/data-grid";

import 'devextreme/dist/css/dx.common.css';
import 'devextreme/dist/css/dx.light.css';
import 'antd/dist/antd.css';

import TimeChart from "./timeChart";
import moment from "moment";

const { RangePicker } = DatePicker;
const { Option } = Select;

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
  const [db] = useState(props.data);
  const [startDate, setStartDate] = useState(props.startDate);
  const [endDate, setEndDate] = useState(props.endDate);
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

  const getData = () => {
    let i = 1;
    let tempData = [];
    db.forEach((entry) => {
      if (isEntryValid(entry)) {
        tempData.push({
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

    return tempData;
  }
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
    let dates = entries.map(entry => entry["_d"]);
    setStartDate(dates[0]);
    setEndDate(dates[1]);
  };

  const changeTags = (newTags) => {
    setTags(newTags);
  };

  const changeGroupBy = (newGroupBy) => {
    setGroupBy(newGroupBy);
  };

  const changeChartType = (newChartType) => {
    setChartType(newChartType);
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
      className,
      labelText,
      selectName,
      options,
      onChange
  ) => (
      <div className={className} >
        <FormLabel>{labelText}</FormLabel>
        <Select
            mode='multiple'
            allowClear
            placeholder='No filter'
            style={{ width: '200px', margin: '5px' }}
            value={selectName}
            onChange={onChange}
            tokenSeparators={[',']}
        >
          {options.map(option =>
            <Option value={option}>{option}</Option>
          )}
        </Select>
      </div>
  );

  const selectSingleComponent = (
      className,
      labelText,
      selectName,
      options,
      onChange
  ) => (
      <div className={className} style={{ width:"250px" }} >
        <FormLabel>{labelText}</FormLabel>
        <Select
            value={selectName}
            onChange={onChange}
            size='large'
        >
          {options.map(option =>
            <Option value={option["value"]}>{option["label"]}</Option>
          )}
        </Select>
      </div>
  );

  const datePickerRow = () => (
      <Grid container justify={"space-evenly"} style={{ margin: '5px' }}>
        <RangePicker
            size='large'
            value={[moment(startDate), moment(endDate)]}
            onChange={changeDate}
        />
      </Grid>
  );

  const selectComponentGrid = () => (
      <div>
        <Grid container justify={"space-evenly"} >
          {selectMultiComponent(
              "teamForm",
              "Teams:",
              team,
              allTeams,
              changeTeam
          )}
          {selectMultiComponent(
              "userForm",
              "User:",
              teamMember,
              allTeamMembers,
              changeTeamMembers
          )}
        </Grid>
        <Grid container justify={"space-evenly"} >
          {selectMultiComponent(
              "activityForm",
              "Activity:",
              activity,
              allActivities,
              changeActivities
          )}
          {selectMultiComponent(
              "tagForm",
              "Tags:",
              tags,
              allTags,
              changeTags
          )}
        </Grid>
      </div>
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
      <Grid container justify={"space-evenly"} style={{ margin: 5 }}>
        {selectSingleComponent(
            "sortForm",
            "Group By:",
            groupBy,
            GROUP_METHODS,
            changeGroupBy
        )}
        {selectSingleComponent(
            "chartTypeForm",
            "Chart Type:",
            chartType,
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
          <TimeChart
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
