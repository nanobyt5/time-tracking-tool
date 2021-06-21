import React from "react"
import { Link } from "react-router-dom";

function NavBar() {
    const navStyle = {
        color: 'white',
        textDecoration: 'none'
    };

    return (
        <nav>
            <h2>Time Tracking Tool</h2>
            <ul className="nav-links">
                <Link style={navStyle} to="/">
                    <li>Home</li>
                </Link>
                <Link style={navStyle} to="/time">
                    <li>Time Spent</li>
                </Link>
                <Link style={navStyle} to="/sprint_velocity">
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
