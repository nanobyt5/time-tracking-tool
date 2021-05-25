Steps to build from scratch

create-react-app project-name
npm start

// Install Bootstrap
npm i bootstrap@5.0.1

// Deploy to S3
npm run build && aws s3 sync build/ s3://bucket-name

// package.json
"deploy": "react-scripts build && aws s3 sync build/ s3://bucket-name"
