import React, { Component } from "react";
import { observer } from "mobx-react";
import AWS from "aws-sdk";
import ExcelStore from "../../stores/excelStore";

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

class S3Checkbox extends Component {
  constructor() {
    super();
    this.state = {
      // excelFiles: [],
      fileNames: [],
      labelValue: "",
      fileList: [],
      checkedState: [],
      isCheckAll: false,
    };
  }

  componentDidMount() {
    this.getListS3();
  }

  async getListS3() {
    s3.listObjectsV2(s3Params, (err, data) => {
      if (err) {
        console.log(err, err.stack);
      } else {
        this.setState({
          fileList: data.Contents,
          checkedState: new Array(data.Contents.length).fill(false),
        });
      }
    });
  }

  handleOnListChange = (e) => {
    const params = {
      Bucket: "time-tracking-storage",
      Key: e.target.value,
    };

    const updatedCheckedState = this.state.checkedState.map((item, index) =>
      `custom-checkbox-${index}` === e.target.id ? !item : item
    );

    if (e.target.checked === true) {
      this.exportFromS3(params);

      var addName = this.state.fileNames;
      addName.push(params.Key);

      let checker = updatedCheckedState.every((item) => {
        return item === true;
      });

      this.setState({
        checkedState: updatedCheckedState,
        fileNames: addName,
        isCheckAll: checker,
        labelValue: addName.toString(),
      });
    } else {
      var newItems = this.state.fileNames.filter((item) => item !== params.Key);
      var newFiles = ExcelStore.excelFiles.filter(
        (item) => {
          if (item.name !== params.Key) {
            return true;
          }
          return false;
        }
      );

      console.log('initial excel store:', [...ExcelStore.excelFiles]);
      ExcelStore.excelFiles = newFiles;
      console.log('updated excel store:', [...ExcelStore.excelFiles]);

      this.setState({
        checkedState: updatedCheckedState,
        isCheckAll: false,
        fileNames: newItems,
        // excelFiles: newFiles,
        labelValue: newItems.toString(),
      });
    }
  };

  handleSelectAll = (e) => {
    var updatedCheckedState = new Array(this.state.fileList.length);
    var updatedFileNames = [];

    if (e.target.checked === true) {
      updatedCheckedState = updatedCheckedState.fill(true);

      this.state.fileList.forEach(function (item) {
        updatedFileNames.push(item.Key);
      });
      for (const file of updatedFileNames) {
        const params = {
          Bucket: "time-tracking-storage",
          Key: file,
        };
        this.exportFromS3(params);
      }
      this.setState({
        fileNames: updatedFileNames,
      });
    } else {
      updatedCheckedState = updatedCheckedState.fill(false);

      ExcelStore.excelFiles = [];

      this.setState({
        fileNames: updatedFileNames,
        // excelFiles: [],
      });
    }

    this.setState({
      isCheckAll: e.target.checked,
      checkedState: updatedCheckedState,
      labelValue: updatedFileNames.toString(),
    });
  };

  exportFromS3 = async (params) => {
    var addFile = ExcelStore.excelFiles;
    s3.getObject(params, (err, data) => {
      if (data) {
        let file = new Blob([data.Body], {
          type: data.ContentType,
        });
        // addFile.push(file);
        ExcelStore.excelFiles.push({
          name: params.Key,
          blob: file
        });
        console.log('Excel store added:', ExcelStore.excelFiles);
        // this.setState({ excelFiles: addFile });
      } else {
        console.log("Error: " + err);
      }
    });
  };

  render() {
    return (
      <div className="card">
        <div className="card-header">Excel Files</div>
        <ul className="list-group">
          <li className="list-group-item">
            <input
              type="checkbox"
              checked={this.state.isCheckAll}
              onChange={this.handleSelectAll.bind(this)}
            />
            &nbsp;
            <label>Select All</label>
          </li>
          {this.state.fileList.map((name, index) => (
            <li className="list-group-item" key={index}>
              <input
                type="checkbox"
                id={`custom-checkbox-${index}`}
                name="checkFiles"
                value={name.Key}
                checked={this.state.checkedState[index]}
                onChange={this.handleOnListChange.bind(this)}
              />
              &nbsp;
              <label>{name.Key}</label>
            </li>
          ))}
          <label id="statusLabel">{this.state.labelValue}</label>
        </ul>
      </div>
    );
  }
}

export default observer(S3Checkbox);
