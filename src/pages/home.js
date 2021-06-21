import React from 'react';
import InsertData from '../components/insertData';
import ReadData from '../components/readData';
import ReplaceData from '../components/replaceData';
import S3File from '../components/s3File';

function Home() {
    return (
        <div>
            <h3>Home Page</h3>
            <div className="row g-0">
                <div id="insert"><InsertData /></div>
                <div id="read"><ReadData /></div>
                <div id="replace"><ReplaceData /></div>
            </div>
            <S3File />
        </div>
    );
}

export default Home;
