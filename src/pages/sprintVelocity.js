import React from "react";
import SprintVelocityComponent from '../components/sprintVelocityChart'

function SprintVelocity(props) {
    let { data } = props.location.state;

    return (
        <div>
            <SprintVelocityComponent data={data} />
        </div>
    )
}

export default SprintVelocity;