# TIME TRACKING TOOL

Created by [Nazryl Lim](https://www.linkedin.com/in/nazryllim/), [Marcus Ong](https://www.linkedin.com/in/marcus-ong-25205618b) and [Janessa Tng](https://www.linkedin.com/in/janessatng).

## Introduction

The purpose of a time tracking tool is to boost productivity. It's used to calculate sprint velocity, anticipate sprints, as well as estimate project story points. This project is geared toward Lexagle personnel.

## Getting Started

### Installation (Windows)

1. [Node.js SDK](https://nodejs.org/en/download/)
2. [Visual Studio Code](https://code.visualstudio.com/)\
   a. Simple React Snippets - burkeholland.simple-react-snippets\
   b. Prettier Code formatter - esbenp.prettier-vscode
3. [AWS CLI](https://aws.amazon.com/cli/)

## Setup

### AWS CLI

Open Command Prompt

```
aws configure
```

```
AWS Access Key ID [None]: 'INSERT ACCESS KEY ID'
AWS Secret Access Key [None]: 'INSERT SECRET ACCESS KEY'
Default region name [None]: ap-southeast-1
Default output format [None]: json
```

### Setup React Project

Create new React Project App\
Open Command Prompt

```
create-react-app 'project-name'
npm start
```

### Visual Studio Code

Install Bootstrap for CSS\
Open terminal in VS Code

```
npm install bootstrap
```

Install MobX (Stores states)
Open terminal in VS Code

```
npm install mobx
```

Install mobx-react (Observer)
Open terminal in VS Code

```
npm install mobx-react
```

Install react-router-dom (Page routing)
Open terminal in VS Code

```
npm install react-router-dom
```

Install Chart and Table

```
npm install @ant-design/charts
npm install devextreme@21.1 devextreme-react@21.1
```

Install Slider, filter options and import/export

```
npm install antd
npm install tslib
npm install @material-ui/core
```

Install XLSX to read CSV files

```
npm i xlsx
```

Install Compare Dates for filter

```
npm i react-moment
```

Install S3 Bucket Commands

```
npm i aws-sdk
```

Install Convert data back to CSV

```
npm i file-saver
```

### S3 Bucket

1. Go to [AWS S3 Bucket](https://aws.amazon.com/console/)
2. Create a Bucket
3. Keep settings by default
4. Uncheck **Block all public access**
5. Set Bucket policy (Change BUCKETNAME to your bucket name)

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AllowPublicReadAccess",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::BUCKETNAME/*"
        }
    ]
}
```

6. Set Cross-origin resource sharing (CORS) to enable GET and POST

```
[
    {
        "AllowedHeaders": [],
        "AllowedMethods": [
            "POST",
            "GET"
        ],
        "AllowedOrigins": [
            "*"
        ],
        "ExposeHeaders": []
    }
]
```

### Connect to S3 time-tracking-tool Bucket

Complete AWS CLI setup.\
This allows developers to upload built project straight into S3 bucket without manually uploading the files.\
Add Deploy NPM Script (Add to package.json under `scripts`)\
Change BUCKETNAME to your bucket name

```
"deploy": "react-scripts build && aws s3 sync build s3://BUCKETNAME"
```

### Retrieve Time Tracking Tool site link

1. Go to time-tracking-tool bucket.
2. Properties
3. Static website hosting link
   http://time-tracking-tool.s3-website-ap-southeast-1.amazonaws.com/
