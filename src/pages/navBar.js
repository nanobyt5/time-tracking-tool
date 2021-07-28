import React from "react"
import { NavLink } from "react-router-dom";

function NavBar() {
    const boldStyle = {
        fontWeight: "bold"
    };

    return (
        <nav>
            <h5>Time Tracking Tool</h5>
            <ul className="nav-links">
                <NavLink exact activeStyle={boldStyle} to="/">
                    <li>Time Spent</li>
                </NavLink>
                <NavLink activeStyle={boldStyle} to="/sprint">
                    <li>Sprint Velocity</li>
                </NavLink>
                <NavLink activeStyle={boldStyle} to="/files">
                    <li>File Manager</li>
                </NavLink>
            </ul>
        </nav>
    );
}

export default NavBar;
