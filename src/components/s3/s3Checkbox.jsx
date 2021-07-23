import React, { Component } from "react";
import { observer } from "mobx-react";
import AWS from "aws-sdk";
import StateStore from "../../stores/stateStore";

AWS.config.update({
  accessKeyId: "AKIAZEGOI2Y3KR4S3SPT",
  secretAccessKey: "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",
  region: "ap-southeast-1",
});

const s3 = new AWS.S3();

const s3Params = {
  Bucket: "time-tracking-storage",
  Delimiter: "",
  Prefix: "time/",
};

class S3Checkbox extends Component {
  constructor() {
    super();

    let stateArray = "";
    StateStore.jsonFiles.forEach(function (entry) {
      stateArray += entry.name + "\n";
    });

    this.state = {
      fileNames: [],
      labelValue: stateArray,
      fileList: [],
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
        let checkAll = false;

        if (StateStore.checkboxState.length > 0) {
          checkAll = StateStore.checkboxState.every((item) => {
            return item === true;
          });
        } else if (StateStore.checkboxState.length === 0) {
          StateStore.checkboxState = new Array(data.Contents.length).fill(
            false
          );
        }

        this.setState({
          fileList: data.Contents,
          isCheckAll: checkAll,
        });
      }
    });
  }

  handleOnListChange = (e) => {
    const params = {
      Bucket: "time-tracking-storage",
      Key: e.target.value,
    };

    const updatedCheckedState = StateStore.checkboxState.map((item, index) =>
      `custom-checkbox-${index}` === e.target.id ? !item : item
    );

    if (e.target.checked === true) {
      this.exportFromS3(params);

      var addName = this.state.fileNames;
      addName.push(params.Key);

      let checker = updatedCheckedState.every((item) => {
        return item === true;
      });

      StateStore.checkboxState = updatedCheckedState;

      this.setState({
        fileNames: addName,
        isCheckAll: checker,
      });
    } else {
      var newItems = this.state.fileNames.filter((item) => item !== params.Key);
      var newFiles = StateStore.jsonFiles.filter(
        (item) => item.name !== params.Key
      );

      StateStore.jsonFiles = newFiles;
      StateStore.checkboxState = updatedCheckedState;

      this.setState({
        isCheckAll: false,
        fileNames: newItems,
      });

      let stateArray = "";
      StateStore.jsonFiles.forEach(function (entry) {
        stateArray += entry.name + "\n";
      });

      this.setState({
        labelValue: stateArray,
      });
    }
  };

  handleSelectAll = (e) => {
    var updatedCheckedState = new Array(this.state.fileList.length);
    var updatedFileNames = [];
    StateStore.jsonFiles = [];

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

      this.setState({
        fileNames: updatedFileNames,
      });

      this.setState({
        labelValue: "",
      });
    }
    StateStore.checkboxState = updatedCheckedState;

    this.setState({
      isCheckAll: e.target.checked,
    });
  };

  exportFromS3 = async (params) => {
    s3.getObject(params, (err, data) => {
      if (data) {
        let content = data.Body.toString();

        // ExcelStore.jsonFiles.push(content)

        // let file = new File([content], params.Key, {
        //   type: data.ContentType,
        // });
        StateStore.jsonFiles.push({
          name: params.Key,
          content: content,
        });

        let stateString = "";
        StateStore.jsonFiles.forEach(function (entry) {
          stateString += entry.name + "\n";
        });

        this.setState({
          labelValue: stateString,
        });
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
                checked={StateStore.checkboxState[index]}
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
