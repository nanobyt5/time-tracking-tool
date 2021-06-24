import React from 'react';
// import InsertData from '../components/lambda/insertData';
// import ReadData from '../components/lambda/readData';
// import ReplaceData from '../components/lambda/replaceData';
import S3File from '../components/s3/s3File';

function Home() {
    return (
        <div>
            <h3>Home Page</h3>
            <S3File />
        </div>
    );
}

export default Home;
