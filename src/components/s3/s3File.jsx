import React, { Component } from "react";
import AWS from "aws-sdk";
import FileSaver from "file-saver";
import DeleteFile from "./deleteFile";
import UploadFile from "./uploadFile";
import ExportFile from "./exportFile";

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

const processData = dataString => {
  const dataStringLines = dataString.split(/\r\n|\n/);
  const headers = dataStringLines[0].split(/,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/);

  const list = [];
  for (let i = 1; i < dataStringLines.length; i++) {
    const row = dataStringLines[i].split(/,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/);
    if (headers && row.length === headers.length) {
      const obj = {};
      for (let j = 0; j < headers.length; j++) {
        let d = row[j];
        if (d.length > 0) {
          if (d[0] === '"')
            d = d.substring(1, d.length - 1);
          if (d[d.length - 1] === '"')
            d = d.substring(d.length - 2, 1);
        }
        if (headers[j]) {
          obj[headers[j]] = d;
        }
      }

      // remove the blank rows
      if (Object.values(obj).filter(x => x).length > 0) {
        list.push(obj);
      }
    }
  }

  return list;
}

class S3File extends Component {
  constructor() {
    super();
    this.state = {
      listFiles: [],
      fileName: null,
      labelValue: null,
      selectedFile: null,
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

  async uploadInS3(params) {
    s3.putObject(params, (err, data) => {
      if (data) {
        console.log(params.Key + " uploaded successfully.");
        this.getListS3();
      } else {
        console.log("Error: " + err);
      }
    });
  }

  async exportFromS3(params) {
    s3.getObject(params, function (err, data) {
      if (data) {
        // let content = data.Body.toString('utf-8');
        // console.log("content", processData(content));
        var filename = params.Key;
        var blob = new Blob([data.Body], {
          type: "",
        });
        FileSaver.saveAs(blob, filename);
      } else {
        console.log("Error: " + err);
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

  handleOnUpload = () => {
    if (this.state.selectedFile === null) {
      this.setState({ labelValue: "No file selected." });
    } else {
      const params = {
        Bucket: "time-tracking-storage",
        Key: this.state.selectedFile.name,
        ContentType: this.state.selectedFile.type,
        Body: this.state.selectedFile,
      };

      if (
        window.confirm("Are you sure you want to upload " + params.Key + "?")
      ) {
        this.uploadInS3(params);

        this.setState({
          labelValue: params.Key + " upload successfully.",
          selectedFile: null,
        });
      } else {
        this.setState({ labelValue: params.Key + " not uploaded." });
      }
    }
  };

  handleOnExport = () => {
    const params = {
      Bucket: "time-tracking-storage",
      Key: this.state.fileName,
    };

    if (params.Key === null) {
      this.setState({ labelValue: "No file selected." });
    } else {
      this.exportFromS3(params);
      this.setState({ labelValue: params.Key + " downloaded." });
    }
  };

  handleOnDelete = () => {
    const params = {
      Bucket: "time-tracking-storage",
      Key: this.state.fileName,
    };

    if (params.Key === null) {
      this.setState({ labelValue: "No file selected." });
    } else if (
      window.confirm("Are you sure you want to delete " + params.Key + "?")
    ) {
      this.deleteInS3(params);
      this.setState({
        labelValue: params.Key + " deleted successfully.",
        fileName: null,
      });

      var newItems = this.state.listFiles.filter((item) => {
        return item.Key !== params.Key;
      });
      this.setState({
        listFiles: newItems,
      });
    } else {
      this.setState({ labelValue: params.Key + " not deleted." });
    }
  };

  handleOnUploadChange = (e) => {
    this.setState({
      selectedFile: e.target.files[0],
      labelValue: e.target.value + " is ready for upload.",
    });
  };

  handleOnListChange = (e) => {
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
                onChange={this.handleOnListChange.bind(this)}
              />
              &nbsp;
              <label>{name.Key}</label>
            </li>
          ))}
          <ExportFile handleOnExport={this.handleOnExport.bind(this)} />
          <DeleteFile handleOnDelete={this.handleOnDelete.bind(this)} />
          <UploadFile
            handleOnUpload={this.handleOnUpload.bind(this)}
            handleOnUploadChange={this.handleOnUploadChange.bind(this)}
          />
          <label id="statusLabel">{this.state.labelValue}</label>
        </ul>
      </div>
    );
  }
}

export default S3File;
