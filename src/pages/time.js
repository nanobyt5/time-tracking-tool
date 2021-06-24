import React from "react";
import TimeComponent from "../components/time";
import LightCSS from "devextreme/dist/css/dx.light.css";
import ANTDCSS from "antd/dist/antd.css";

function Time() {
    return (
        <div>
            <TimeComponent style={LightCSS && ANTDCSS} />
        </div>
    );
}

export default Time;
