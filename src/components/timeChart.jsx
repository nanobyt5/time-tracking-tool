import React, { useEffect, useState } from "react";
import { Column, Pie } from "@ant-design/charts";
import { Radio } from "antd";

import "../css/timeChart.css";

const CHART_TYPES = [
  { value: "bar", label: "Bar Chart" },
  { value: "donut", label: "Doughnut Chart" },
];

const INITIAL_CHART_TYPE = "donut";

/**
 * Creates the time chart for the time per activity page. It has the state: chartType. chartType has
 * the initial state of donut.
 */
function TimeChart(props) {
  const [groupBy, setGroupBy] = useState("");
  const [chartData, setChartData] = useState([]);
  const [chartType, setChartType] = useState(INITIAL_CHART_TYPE);

  /**
   * Gets the chart data from the db to be used for the time per activity charts.
   */
  const getChartData = (db, groupBy) => {
    if (!groupBy) {
      return;
    }

    let labels = [];
    let lookUp = {};

    db.forEach((entry) => {
      let label = entry[groupBy];
      let hours = entry["hours"];

      if (hours === "") {
        return;
      }

      if (!(label in lookUp)) {
        lookUp[label] = parseFloat(hours);
        labels.push(label);
      } else {
        lookUp[label] += parseFloat(hours);
      }
    });

    labels.sort();

    let chartData = [];
    labels.forEach((label) => {
      chartData.push({
        type: label,
        value: lookUp[label],
      });
    });
    setChartData(chartData);
  };

  /**
   * Capitalises the first letter of the word given.
   */
  const capitalize = (word) => {
    return word.slice(0, 1).toUpperCase() + word.slice(1, word.length);
  };

  /**
   * Update the time chart when the props given from time table changes.
   */
  useEffect(() => {
    let newDb = props["data"];
    let newGroupBy = props["groupBy"];
    setGroupBy(newGroupBy);
    getChartData(newDb, newGroupBy);
  }, [props]);

  /**
   * Gets the config for the bar chart.
   */
  const getColConfig = () => ({
    data: chartData,
    xField: "type",
    yField: "value",
    label: {
      position: "middle",
      style: {
        fill: "#FFFFFF",
        opacity: 0.6,
      },
    },
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: true,
        autoEllipsis: true,
      },
    },
    meta: {
      type: { alias: capitalize(groupBy) },
      value: { alias: "Hours" },
    },
  });

  /**
   * Gets the config for the donut chart.
   */
  const getDonutConfig = () => ({
    appendPadding: 10,
    data: chartData,
    angleField: "value",
    colorField: "type",
    radius: 1,
    innerRadius: 0.6,
    label: {
      type: "inner",
      offset: "-50%",
      content: function content(_ref) {
        let percent = _ref.percent;
        return "".concat((percent * 100).toFixed(0), "%");
      },
      style: {
        textAlign: "center",
        fontSize: 18,
      },
    },
    interactions: [{ type: "element-selected" }, { type: "element-active" }],
    statistic: {
      title: false,
      content: {
        style: {
          whiteSpace: "pre-wrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        },
        content: capitalize(groupBy) + "\nChart",
      },
    },
    legend: {
      layout: "horizontal",
      position: "bottom",
    },
  });

  /**
   * Changes the chart type between donut and bar chart.
   */
  const changeChartType = (e) => {
    setChartType(e.target.value);
  };

  /**
   * Gets chart components based on the group by state.
   */
  const getChart = () => {
    switch (chartType) {
      case "bar":
        return <Column {...getColConfig()} />;

      case "donut":
        return <Pie {...getDonutConfig()} />;

      default:
        throw new Error();
    }
  };

  const radioComponent = (className, selectName, radios, onChange) => (
    <div className={className}>
      <Radio.Group value={selectName} onChange={onChange}>
        {radios.map((radio) => (
          <Radio key={radio["label"]} value={radio["value"]}>
            {radio["label"]}
          </Radio>
        ))}
      </Radio.Group>
    </div>
  );

  return (
    <div>
      <div className="timeChartComponent">
        {radioComponent(
          "chartTypeForm",
          chartType,
          CHART_TYPES,
          changeChartType
        )}
        <div className="timeChart">{getChart()}</div>
      </div>
    </div>
  );
}

export default TimeChart;
