import React from "react";
import SprintVelocityComponent from '../components/sprintVelocityChart'

function SprintVelocity(props) {
    let { data } = props.location.state;

    let barData = [];
    let lineData = [];
    let tableData = [];
    const populateData = (lookUp, sprints) => {
        let i = 0;
        sprints.forEach(sprint => {
            let currSprint = lookUp[sprint];
            let hours = currSprint["hours"];
            let storyPoints = currSprint["storyPoints"];
            let velocity = storyPoints / (hours / 8);

            barData.push(
                {
                    key: `${i}.1`,
                    sprint: sprint,
                    value: hours,
                    type: 'Time Spent'
                },
                {
                    key: `${i}.2`,
                    sprint: sprint,
                    value: storyPoints,
                    type: 'Total Story Points'
                })

            lineData.push({
                key: i,
                sprint: sprint,
                velocity: velocity
            })

            tableData.push(
                {
                    key: i++,
                    sprint: sprint,
                    capacity: hours,
                    completed: storyPoints,
                    velocity: velocity
                }
            )
        })
    }

    const getChartData = () => {
        let lookUp = {};
        let sprints = [];

        data.filter(entry => entry["Team"] === "Tech Team" && entry["Story Points Completed"] !== "")
            .forEach(entry => {
                let sprint = entry["Sprint Cycle"];
                let hours = parseFloat(entry["Hours"]);
                let storyPoints = parseFloat(entry["Story Points Completed"]);

                if (!(sprint in lookUp)) {
                    lookUp[sprint] = {
                        hours: hours,
                        storyPoints: storyPoints
                    };
                    sprints.push(sprint);
                } else {
                    let currEntry = lookUp[sprint];
                    currEntry["hours"] += hours;
                    currEntry["storyPoints"] += storyPoints;
                    lookUp[sprint] = currEntry;
                }
            })

        sprints.sort();

        populateData(lookUp, sprints);
    }

    getChartData();
    return (
        <div>
            <SprintVelocityComponent barData={barData} lineData={lineData} tableData={tableData} />
        </div>
    )
}

export default SprintVelocity;