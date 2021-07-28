import React, { Component } from "react";

class UploadFile extends Component {
  render() {
    return (
      <div className="upload">
        <input
          type="file"
          name="uploadFile"
          onChange={this.props.handleOnUploadChange.bind(this)}
        />
        <button
          type="button"
          className="ant-btn fileButton"
          onClick={this.props.handleOnUpload.bind(this)}
        >
          Upload
        </button>
      </div>
    );
  }
}

export default UploadFile;
