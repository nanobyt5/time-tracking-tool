import React, { Component } from "react";
import AWS from "aws-sdk";
import DeleteFile from "./deleteFile";

AWS.config.update({
  accessKeyId: "AKIAZEGOI2Y3KR4S3SPT",
  secretAccessKey: "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",
  region: "ap-southeast-1",
});
const s3 = new AWS.S3();

const s3Params = {
  Bucket: "time-tracking-storage",
  Delimiter: "",
  Prefix: "",
};

class S3File extends Component {
  constructor() {
    super();
    this.state = {
      listFiles: [],
      fileName: null,
      labelValue: null,
    };

    this.deleteInS3 = this.deleteInS3.bind(this);
    this.getListS3 = this.getListS3.bind(this);
  }

  componentDidMount() {
    this.getListS3();
  }

  async getListS3() {
    s3.listObjectsV2(s3Params, (err, data) => {
      if (err) {
        console.log(err, err.stack);
      } else {
        this.setState({ listFiles: data.Contents });
      }
    });
  }

  async deleteInS3(params) {
    s3.deleteObject(params, function (err, data) {
      if (data) {
        console.log(params.Key + " deleted successfully.");
      } else {
        console.log("Error: " + err);
      }
    });
  }

  handleOnDelete = () => {
    const delParams = {
      Bucket: "time-tracking-storage",
      Key: this.state.fileName,
    };

    if (delParams.Key === null) {
      this.setState({ labelValue: "No file selected." });
    } else if (
      window.confirm("Are you sure you want to delete " + delParams.Key + "?")
    ) {
      this.deleteInS3(delParams);
      this.setState({
        labelValue: delParams.Key + " deleted successfully.",
        fileName: null,
      });

      var newItems = this.state.listFiles.filter((item) => {
        return item.Key !== delParams.Key;
      });
      this.setState({
        listFiles: newItems,
      });
    } else {
      this.setState({ labelValue: delParams.Key + " not deleted." });
    }
  };

  handleOnChange = (e) => {
    this.setState({ fileName: e.target.value, labelValue: null });
  };

  render() {
    return (
      <div className="card">
        <div className="card-header">Storage</div>
        <ul className="list-group">
          {this.state.listFiles.map((name, index) => (
            <li className="list-group-item" key={index}>
              <input
                type="radio"
                name="radioFiles"
                value={name.Key}
                checked={name.Key === this.state.fileName}
                onChange={this.handleOnChange.bind(this)}
              />
              &nbsp;
              <label>{name.Key}</label>
            </li>
          ))}
          <DeleteFile
            handleOnDelete={this.handleOnDelete.bind(this)}
            labelValue={this.state.labelValue}
          />
        </ul>
      </div>
    );
  }
}

export default S3File;
