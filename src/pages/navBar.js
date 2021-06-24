import React, {useState} from "react"
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";

function NavBar() {
    const [data, setData] = useState([]);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());

    // // process CSV data
    // const processData = dataString => {
    //     const dataStringLines = dataString.split(/\r\n|\n/);
    //     const headers = dataStringLines[0].split(/,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/);
    //
    //     const list = [];
    //     let tempStartDate = startDate;
    //     let tempEndDate = endDate;
    //     for (let i = 1; i < dataStringLines.length; i++) {
    //         const row = dataStringLines[i].split(/,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/);
    //         if (headers && row.length === headers.length) {
    //             const obj = {};
    //             for (let j = 0; j < headers.length; j++) {
    //                 let d = row[j];
    //                 if (d.length > 0) {
    //                     if (d[0] === '"')
    //                         d = d.substring(1, d.length - 1);
    //                     if (d[d.length - 1] === '"')
    //                         d = d.substring(d.length - 2, 1);
    //                 }
    //                 if (headers[j]) {
    //                     obj[headers[j]] = d;
    //                 }
    //             }
    //
    //             // remove the blank rows
    //             if (Object.values(obj).filter(x => x).length > 0) {
    //                 let date = new Date(obj["Date"]);
    //
    //                 if (date < tempStartDate) {
    //                     tempStartDate = date;
    //                 }
    //
    //                 if (date > tempEndDate) {
    //                     tempEndDate = date;
    //                 }
    //
    //                 list.push(obj);
    //             }
    //         }
    //     }
    //
    //     setStartDate(tempStartDate);
    //     setEndDate(tempEndDate);
    //     setData(list);
    // }
    //
    // // handle file upload
    // const handleFileUpload = e => {
    //     const file = e.target.files[0];
    //     const reader = new FileReader();
    //     reader.onload = (evt) => {
    //         /* Parse data */
    //         const bStr = evt.target.result;
    //         const wb = XLSX.read(bStr, { type: 'binary' });
    //         /* Get first worksheet */
    //         const wsName = wb.SheetNames[0];
    //         const ws = wb.Sheets[wsName];
    //         /* Convert array of arrays */
    //         const data = XLSX.utils.sheet_to_csv(ws, { header: 1 });
    //         processData(data);
    //     };
    //     reader.readAsBinaryString(file);
    // }

    const navStyle = {
        color: 'white',
        textDecoration: 'none',
        margin: '5px',
        padding: '1px',
    };

    return (
        <nav>
            <h2>Time Tracking Tool</h2>
            <ul className="nav-links">
                {/*<input*/}
                {/*    style={navStyle}*/}
                {/*    type="file"*/}
                {/*    accept=".csv,.xlsx,.xls"*/}
                {/*    onChange={handleFileUpload}*/}
                {/*/>*/}
                <Link style={navStyle} to="/">
                    <li>Home</li>
                </Link>
                <Link style={navStyle}
                      to={{ pathname: "/time", state: {data, startDate, endDate} }}>
                    <li>Time Spent</li>
                </Link>
                <Link style={navStyle} to={{ pathname: "/sprint_velocity", state: {data, startDate, endDate} }}>
                    <li>Sprint Velocity</li>
                </Link>
                <Link style={navStyle} to="/login">
                    <li>Login</li>
                </Link>
            </ul>
        </nav>
    );
}

export default NavBar;
