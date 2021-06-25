import React from "react"
import { Link } from "react-router-dom";

function NavBar() {

    const navStyle = {
        color: 'white',
        textDecoration: 'none'
    };

    return (
        <nav>
            <h2 style={{ color: 'white' }}>Time Tracking Tool</h2>
            <ul className="nav-links">
                <Link style={navStyle} to="/">
                    <li>Time Spent</li>
                </Link>
                <Link style={navStyle} to="/sprint">
                    <li>Sprint Velocity</li>
                </Link>
                <Link style={navStyle} to="/files">
                    <li>Uploaded Files</li>
                </Link>
            </ul>
        </nav>
    );
}

export default NavBar;
