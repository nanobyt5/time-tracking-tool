import React, { useEffect, useState } from "react";
import { observer } from "mobx-react";
import {Button, DatePicker, Drawer, Select} from "antd";
import { FormLabel, Grid } from "@material-ui/core";
import DataGrid, {
  Column, ColumnChooser,
  Export,
  Grouping,
  GroupItem, Scrolling, SearchPanel,
  Selection,
  Summary,
  TotalItem,
} from "devextreme-react/data-grid";
import S3FileCheckbox from "../components/s3/s3Checkbox.jsx";

import StateStore from "../stores/stateStore";

import "../css/time.css";

import TimeChart from "./timeChart";
import moment from "moment";

const { RangePicker } = DatePicker;
const { Option } = Select;

const COLUMNS = [
  {
    dataField: "date",
    dataType: "date",
    toGroup: false,
  },
  {
    dataField: "sprint",
    dataType: "string",
    toGroup: false,
  },
  {
    dataField: "team",
    dataType: "string",
    toGroup: false,
  },
  {
    dataField: "member",
    dataType: "string",
    toGroup: false,
  },
  {
    dataField: "activity",
    dataType: "string",
    toGroup: false,
  },
  {
    dataField: "tags",
    dataType: "string",
    toGroup: false,
  },
  {
    dataField: "storyPoints",
    dataType: "number",
    toGroup: false,
  },
  {
    dataField: "planned",
    dataType: "string",
    toGroup: false,
  },
  {
    dataField: "hours",
    dataType: "number",
    toGroup: false,
  }
];

const GROUP_METHODS = [
  { value: "", label: "All" },
  { value: "activity", label: "Activity" },
  { value: "member", label: "Member" },
  { value: "sprint", label: "Sprint" },
  { value: "tags", label: "Tags" },
  { value: "team", label: "Team" },
  { value: "planned", label: "Planned" }
];

const INITIAL_GROUP_BY = "tags";

/**
 * Creates the time spent per activity page. It has states: db, minDate, maxDate, startDate, endDate,
 * team, member, activity, tags, groupBy, columns.
 */
function Time() {
  const [db, setDb] = useState([]);
  const [minDate, setMinDate] = useState(new Date());
  const [maxDate, setMaxDate] = useState(new Date());
  const [allTeams, setAllTeams] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [allActivities, setAllActivities] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [teamsFilter, setTeamsFilter] = useState([]);
  const [membersFilter, setMembersFilter] = useState([]);
  const [activitiesFilter, setActivitiesFilter] = useState([]);
  const [tagsFilter, setTagsFilter] = useState([]);
  const [groupBy, setGroupBy] = useState(INITIAL_GROUP_BY);
  const [columns, setColumns] = useState(COLUMNS);
  const [importDrawerVisibility, setImportDrawerVisibility] = useState(false);

  /**
   * Gets all distinct entries based on the toGet field.
   */
  const getAllFromDb = (toGet, db) => {
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
  const getAllTags = (db) => {
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
   * Process the merged data to get the relevant data for the time page.
   */
  const processData = (content) => {
    let tempStartDate = new Date(8640000000000000);
    let tempEndDate = new Date(-8640000000000000);

    if (content.length === 0) {
      tempStartDate = new Date();
      tempEndDate = new Date();
    }

    content.forEach((entry) => {
      let date = new Date(entry["Date"]);
      if (date < tempStartDate) {
        tempStartDate = date;
      }

      if (date > tempEndDate) {
        tempEndDate = date;
      }
    });

    setMinDate(tempStartDate);
    setMaxDate(tempEndDate);
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setDb(content);
    setAllActivities(getAllFromDb("Activity", content));
    setAllMembers(getAllFromDb("Member", content));
    setAllTags(getAllTags(content));
    setAllTeams(getAllFromDb("Team", content));
  };

  /**
   * Handles the data selected by the user to be shown in the page.
   */
  const processJsonToTable = () => {
    let content = [];
    StateStore.jsonFiles.forEach((json) =>
      content.push(JSON.parse(json["content"]))
    );
    processData(content.flat());
  };

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

    let isDateAccepted = date <= endDate && date >= startDate;
    let isTeamAccepted = teamsFilter.length === 0 || teamsFilter.includes(entryTeam);
    let isMemberAccepted = membersFilter.length === 0 || membersFilter.includes(user);
    let isActivityAccepted =
      activitiesFilter.length === 0 || activitiesFilter.includes(entryActivity);
    let areTagsAccepted = tagsFilter.length === 0;

    for (let t of entryTags) {
      if (tagsFilter.includes(t.trim())) {
        areTagsAccepted = true;
        break;
      }
    }

    return (
      isDateAccepted && isActivityAccepted && areTagsAccepted && isMemberAccepted && isTeamAccepted
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
          storyPoints: entry["Story Points"],
          planned: entry["Unplanned"] === "No" ? "Yes" : "No"
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
    setTeamsFilter(newTeams);
  };

  /**
   * Updates filters with the new team members.
   */
  const changeMember = (newUsers) => {
    setMembersFilter(newUsers);
  };

  /**
   * Updates filters with the new activities.
   */
  const changeActivities = (newActivities) => {
    setActivitiesFilter(newActivities);
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
    setTagsFilter(newTags);
  };

  /**
   * Updates with new group by option.
   */
  const changeGroupBy = (newGroupBy) => {
    setGroupBy(newGroupBy);
  };

  /**
   * Checks whether the date inputted is in between the min and max dates.
   */
  const checkDate = (date) => {
    return date < moment(minDate) || date > moment(maxDate);
  };

  useEffect(() => {
    processJsonToTable();
  }, [StateStore.jsonFiles.length]);

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

  const importComponent = () => (
    <div className="importButton">
      <Button
        size="medium"
        onClick={ () => {setImportDrawerVisibility(true)} }
      >
        Import
      </Button>
      <Drawer
        title="Import From S3"
        placement="right"
        width="450"
        closable={false}
        onClose={ () => {setImportDrawerVisibility(false)} }
        visible={ importDrawerVisibility }
      >
        <S3FileCheckbox />
      </Drawer>
    </div>
  )

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
      allowColumnReordering={true}
      style={{ margin: 5 }}
    >
      <SearchPanel visible={true} />
      <ColumnChooser
          enabled={true}
          mode="select"
      />
      <Grouping
          autoExpandAll={true}
          texts={{ groupByThisColumn: {groupBy} }}
          expandMode="rowClick"
      />
      <Selection mode="single" />
      <Scrolling mode="virtual" />

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
          displayFormat="{0}hrs"
          valueFormat="#.###"
          alignByColumn={true}
        />
        <TotalItem
          column="hours"
          summaryType="sum"
          displayFormat="Total: {0}hrs"
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
      {selectMultiComponent("Team:", teamsFilter, allTeams, changeTeam)}
      {selectMultiComponent("Member:", membersFilter, allMembers, changeMember)}
      {selectMultiComponent(
        "Activity:",
        activitiesFilter,
        allActivities,
        changeActivities
      )}
      {selectMultiComponent("Tags:", tagsFilter, allTags, changeTags)}
    </Grid>
  );

  return (
    <div>
      <div className="titleComponent">
        <h2>Time Per "{groupBy}"</h2>
        {importComponent()}
      </div>
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
