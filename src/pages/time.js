import React from "react";
import TimeComponent from "../components/time";

function Time(props) {
     let { data, startDate, endDate } = props.location.state;

    return (
        <div>
            <TimeComponent data={data} startDate={startDate} endDate={endDate} />
        </div>
    );
}

export default Time;
