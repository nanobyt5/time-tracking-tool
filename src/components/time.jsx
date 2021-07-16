import React, { useEffect, useState } from "react";
import { observer } from "mobx-react";
import { DatePicker, Select } from "antd";
import { FormLabel, Grid } from "@material-ui/core";
import DataGrid, {
  Column,
  Export,
  Grouping,
  GroupItem, GroupPanel, SearchPanel,
  Selection,
  Summary,
  TotalItem,
} from "devextreme-react/data-grid";

import ExcelStore from "../stores/excelStore";

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
    dataField: "storyPoints",
    dataType: "number",
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
  { value: "member", label: "Member" },
  { value: "sprint", label: "Sprint" },
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
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [team, setTeam] = useState([]);
  const [member, setMember] = useState([]);
  const [activity, setActivity] = useState([]);
  const [tags, setTags] = useState([]);
  const [groupBy, setGroupBy] = useState(INITIAL_GROUP_BY);
  const [columns, setColumns] = useState(COLUMNS);

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

    content.forEach(entry => {
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
    setDb(content);
  };

  /**
   * Handles the data selected by the user to be shown in the page.
   */
  const handleFileUpload = () => {
    let content = [];
    ExcelStore.excelFiles.forEach(json => content.push(JSON.parse(json['content'])));
    processData(content.flat());
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
          storyPoints: entry["Story Points"]
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
      <SearchPanel visible={true} />
      <GroupPanel
          visible={true}
      />
      <Grouping
          autoExpandAll={true}
          groupByThisColumn={groupBy}
          contextMenuEnabled={true}
          expandMode="rowClick"
      />
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
