import React, { Component } from "react";
import { observer } from "mobx-react";
import AWS from "aws-sdk";
import StateStore from "../../stores/stateStore";
import {Table} from "antd";

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

const TIME_UPLOAD_COLUMNS = [
  {
    title: 'File Name',
    dataIndex: 'key'
  }
];

class S3Checkbox extends Component {
  constructor() {
    super();

    this.state = {
      fileNames: [],
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
        this.setState({
          fileList: []
        })
      } else {
        let id = 1;
        let s3Data = data.Contents.map(content => {
          return {
            id: id++,
            key: content["Key"]
          }
        });
        // if (StateStore.checkboxState.length > 0) {
        //   checkAll = StateStore.checkboxState.every((item) => {
        //     return item === true;
        //   });
        // } else if (StateStore.checkboxState.length === 0) {
        //   StateStore.checkboxState = new Array(data.Contents.length).fill(
        //     false
        //   );
        // }

        this.setState({
          fileList: s3Data,
          // isCheckAll: checkAll,
        });
      }
    });
  }

  onSelect = (selectedRow, isSelected) => {
    const key = selectedRow["key"];
    let newFileNames = [...StateStore.checkboxState];
    const params = {
      Bucket: "time-tracking-storage",
      Key: key,
    };

    if (isSelected) {
      this.importFromS3(params)
          .then(file => {
            StateStore.checkboxState.push(key);
            StateStore.jsonFiles.push(file);
          });
      newFileNames.push(key);

      StateStore.checkboxState = newFileNames;
    } else {
      newFileNames = newFileNames.filter(item => item !== key);

      let newFiles = StateStore.jsonFiles.filter(
          (item) => item.name !== key
      );

      StateStore.jsonFiles = newFiles;
      StateStore.checkboxState = newFileNames;
    }
  };

  onSelectAll = (isSelected, changedRows) => {
    if (isSelected) {
      let promises = [];
      let newCheckBoxState = [...StateStore.checkboxState]
      changedRows.forEach(({ key }) => {
        let params = {
          Bucket: "time-tracking-storage",
          Key: key,
        };
        newCheckBoxState.push(key);
        promises.push(this.importFromS3(params));
      })
      StateStore.checkboxState = newCheckBoxState;

      Promise.all(promises)
          .then(files => {
            files.forEach((file) => {
              StateStore.jsonFiles.push(file);
            })
          })
    } else {
      StateStore.checkboxState = [];
      StateStore.jsonFiles = [];
    }
  };

  importFromS3 = async (params) => {
    return new Promise((resolve => {
      s3.getObject(params, (err, data) => {
        if (data) {
          let content = data.Body.toString();
          resolve({
            name: params["Key"],
            content: content
          });
        } else {
          console.log("Error: " + err);
        }
      });
    }))
  };

  getS3TimeRowSelection = () => ({
    onSelect: (selectedRow, isSelected) => {
      this.onSelect(selectedRow, isSelected);
    },
    onSelectAll: (isSelected, selectedRows, changedRows) => {
      this.onSelectAll(isSelected, changedRows);
    },
    selectedRowKeys: StateStore.checkboxState
  })

  s3TimeTableComponent = () => (
      <div>
        <Table
          rowSelection={ this.getS3TimeRowSelection() }
          columns={ TIME_UPLOAD_COLUMNS }
          dataSource={ this.state.fileList }
        />
      </div>
  )

  render() {
    return (
      <div className="card">
        {this.s3TimeTableComponent()}
        {/*<div className="card-header">Excel Files</div>*/}
        {/*<ul className="list-group">*/}
        {/*  <li className="list-group-item">*/}
        {/*    <input*/}
        {/*      type="checkbox"*/}
        {/*      checked={this.state.isCheckAll}*/}
        {/*      onChange={this.handleSelectAll.bind(this)}*/}
        {/*    />*/}
        {/*    &nbsp;*/}
        {/*    <label>Select All</label>*/}
        {/*  </li>*/}
        {/*  {this.state.fileList.map((name, index) => (*/}
        {/*    <li className="list-group-item" key={index}>*/}
        {/*      <input*/}
        {/*        type="checkbox"*/}
        {/*        id={`custom-checkbox-${index}`}*/}
        {/*        name="checkFiles"*/}
        {/*        value={name.Key}*/}
        {/*        checked={StateStore.checkboxState[index]}*/}
        {/*        onChange={this.onSelect.bind(this)}*/}
        {/*      />*/}
        {/*      &nbsp;*/}
        {/*      <label>{name.Key}</label>*/}
        {/*    </li>*/}
        {/*  ))}*/}
        {/*</ul>*/}
      </div>
    );
  }
}

export default observer(S3Checkbox);
