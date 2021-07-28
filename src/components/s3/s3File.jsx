import React, { Component } from "react";
import AWS from "aws-sdk";
import FileSaver from "file-saver";
import DeleteFile from "./deleteFile";
import UploadFile from "./uploadFile";
import ExportFile from "./exportFile";
import * as XLSX from "xlsx";
import { Table } from "antd";

const s3 = new AWS.S3();

/**
 * Declare bucket name from S3
 */
const s3Params = {
  Bucket: "time-tracking-storage",
  Delimiter: "",
  Prefix: "",
};

const CSV_FILE_ATTACHMENT = ".csv";

const TIME_PAGE_PREFIX = "time/";

const COLUMNS = [
  {
    title: "File Name",
    dataIndex: "key",
  },
];

class S3File extends Component {
  constructor() {
    super();
    this.state = {
      listFiles: [],
      fileName: null,
      labelValue: "",
      selectedFile: null,
    };

    this.deleteInS3 = this.deleteInS3.bind(this);
    this.getListS3 = this.getListS3.bind(this);
  }

  componentDidMount() {
    this.getListS3();
  }

  /**
   * Retrieve list of filenames for the table to display.
   */
  async getListS3() {
    s3.listObjectsV2(s3Params, (err, data) => {
      if (err) {
        console.log(err, err.stack);
      } else {
        let listFiles = data["Contents"].map(({ Key }) => ({ key: Key }));
        this.setState({ listFiles: listFiles });
      }
    });
  }

  /**
   * Export file from S3 bucket
   */
  async exportFromS3(params) {
    s3.getObject(params, function (err, data) {
      const convertJsonToCsv = (json) => {
        let fields = Object.keys(json[0]);
        const replacer = (key, value) => (value === null ? "" : value);
        let csv = json.map((row) =>
          fields.map((field) => JSON.stringify(row[field], replacer)).join(",")
        );
        csv.unshift(fields.join(","));
        csv = csv.join("\r\n");
        return csv;
      };

      if (data) {
        let json = JSON.parse(data.Body.toString());
        let csv = convertJsonToCsv(json);
        let filename = "";
        if (params.Key.includes("time/")) {
          filename = params.Key.replace("time/", "");
        } else {
          filename = params.Key.replace("sprint/", "");
        }

        let blob = new Blob([csv], {
          type: "",
        });
        FileSaver.saveAs(blob, filename + CSV_FILE_ATTACHMENT);
      } else {
        console.log("Error: " + err);
      }
    });
  }

  /**
   * Delete file from S3 bucket
   */
  async deleteInS3(params) {
    s3.deleteObject(params, function (err, data) {
      if (data) {
        console.log(params.Key + " deleted successfully.");
      } else {
        console.log("Error: " + err);
      }
    });
  }

  /**
   * Upload file to S3 bucket
   */
  async uploadToS3(jsonFile) {
    const params = {
      Bucket: "time-tracking-storage",
      Key:
        TIME_PAGE_PREFIX +
        this.state.selectedFile.name.split(CSV_FILE_ATTACHMENT, 1).join(""),
      ContentType: "json",
      Body: JSON.stringify(jsonFile),
    };

    if (window.confirm("Are you sure you want to upload " + params.Key + "?")) {
      s3.putObject(params, (err, data) => {
        if (data) {
          console.log(params.Key + " uploaded successfully.");
          this.getListS3();
        } else {
          console.log("Error: " + err);
        }
      });

      this.setState({
        labelValue: params.Key + " upload successfully.",
        selectedFile: null,
      });
    } else {
      this.setState({ labelValue: params.Key + " not uploaded." });
    }
  }

  /**
   * Converts csv file to JSON and use the data for db, min, max, start, end dates.
   * credit: https://www.cluemediator.com/read-csv-file-in-react
   */
  convertCsvToJson = (dataString) => {
    if (!dataString) {
      return;
    }

    const dataStringLines = dataString.split(/\r\n|\n/);
    const headers = dataStringLines[0].split(
      /,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/
    );
    const jsonFile = [];

    for (let i = 1; i < dataStringLines.length; i++) {
      const row = dataStringLines[i].split(
        /,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/
      );
      if (headers && row.length === headers.length) {
        const obj = {};
        for (let j = 0; j < headers.length; j++) {
          let d = row[j];
          if (d.length > 0) {
            if (d[0] === '"') d = d.substring(1, d.length - 1);
            if (d[d.length - 1] === '"') d = d.substring(d.length - 2, 1);
          }
          if (headers[j]) {
            obj[headers[j]] = d;
          }
        }

        // remove the blank rows
        if (Object.values(obj).filter((x) => x).length > 0) {
          jsonFile.push(obj);
        }
      }
    }

    this.uploadToS3(jsonFile).then(() => "Upload successful!");
  };

  /**
   * Handles when upload button is clicked.
   * credit: https://www.cluemediator.com/read-csv-file-in-react
   */
  handleOnUpload = () => {
    const file = this.state.selectedFile;

    if (file === null) {
      this.setState({ labelValue: "No file selected." });
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      /* Parse data */
      const bStr = evt.target.result;
      const wb = XLSX.read(bStr, { type: "binary" });
      /* Get first worksheet */
      const wsName = wb.SheetNames[0];
      const ws = wb.Sheets[wsName];
      /* Convert array of arrays */
      const data = XLSX.utils.sheet_to_csv(ws, { header: 1 });
      this.convertCsvToJson(data);
    };
    reader.readAsBinaryString(file);
  };

  /**
   * Handles when export button is clicked.
   */
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

  /**
   * Handles when delete button is clicked.
   */
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
      this.deleteInS3(params).then(() => {
        let newFiles = this.state.listFiles.filter(
          ({ key }) => key !== params.Key
        );
        this.setState({
          listFiles: newFiles,
          labelValue: params.Key + " deleted successfully.",
          fileName: null,
        });
      });
    } else {
      this.setState({ labelValue: params.Key + " not deleted." });
    }
  };

  /**
   * Handles when uploaded files is changed.
   */
  handleOnUploadChange = (e) => {
    this.setState({
      selectedFile: e.target.files[0],
      labelValue: e.target.value + " is ready for upload.",
    });
  };

  /**
   * Handles when different radiobutton are clicked.
   */
  handleOnListChange = ({ key }) => {
    this.setState({
      fileName: key,
      labelValue: "",
    });
  };

  getRowSelection = () => ({
    type: "radio",
    onSelect: (selectedRow) => {
      this.handleOnListChange(selectedRow);
    },
  });

  tableComponent = () => (
    <Table
      rowSelection={this.getRowSelection()}
      columns={COLUMNS}
      dataSource={this.state.listFiles}
    />
  );

  render() {
    return (
      <div>
        <h2>File Manager</h2>
        <br></br>
        <div className="card">
          <ul className="list-group">
            {this.tableComponent()}
            <div className="groupButtons">
              <UploadFile
                handleOnUpload={this.handleOnUpload.bind(this)}
                handleOnUploadChange={this.handleOnUploadChange.bind(this)}
              />
              <div className="otherButtons">
                <ExportFile handleOnExport={this.handleOnExport.bind(this)} />
                <DeleteFile handleOnDelete={this.handleOnDelete.bind(this)} />
              </div>
              <br></br>
            </div>
            <label id="statusLabel">{this.state.labelValue}</label>
          </ul>
        </div>
      </div>
    );
  }
}

export default S3File;
