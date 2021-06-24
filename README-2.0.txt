Installation (Windows)

1. Node.js SDK - https://nodejs.org/en/download/
2. Visual Studio Code - https://code.visualstudio.com/
3. Simple React Snippets - burkeholland.simple-react-snippets
4. Prettier Code formatter - esbenp.prettier-vscode
5. AWS CLI - https://aws.amazon.com/cli/

*Setup
    AWS CLI (CMD) - aws configure
                    AWS Access Key ID [None]: 
                    AWS Secret Access Key [None]: 
                    Default region name [None]: 
                    Default output format [None]:

*Project Setup
    React Project create
        create-react-app project-name
        npm start

    Install Bootstrap (CSS)
        npm i bootstrap@5.0.1

    Install MobX (Application state)
        npm mobx --save

    Install mobx-react (Application Observer)
        npm install mobx-react

    Install react-router-dom (Pages)
        npm install react-router-dom

    npm i react-datepicker
    npm i @material-ui/core
    npm i react-select
    npm i date-fns
    npm install devextreme@21.1 devextreme-react@21.1
    npm install react-chartjs-2 chart.js
    npm i aws-sdk
    npm i xlsx
    npm i randomcolor
    npm i file-saver

*Deploy Static Website to S3 (Needs permissions from AWS S3 bucket)
    npm run build && aws s3 sync build/ s3://bucket-name
    
    package.json (Add to NPM scripts)
        "deploy": "react-scripts build && aws s3 sync build/ s3://bucket-name"

*Start editing
    public/index.html
        <div id="title"></div>
    src/components/
        add new .jsx
    src/index.css
        edit styles here
    src/index.js
        import InsertData from './components/insertData';
        ReactDOM.render(<InsertData />, document.getElementById('insert'));
