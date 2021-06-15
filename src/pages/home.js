import React from 'react';
import InsertData from '../components/insertData';
import ReadData from '../components/readData';
import ReplaceData from '../components/replaceData';

function Home() {
    return (
        <div>
            <h3>Home Page</h3>
            <div className="row g-0">
                <div id="insert"><InsertData /></div>
                <div id="read"><ReadData /></div>
                <div id="replace"><ReplaceData /></div>
            </div>
        </div>
    );
}

export default Home;
