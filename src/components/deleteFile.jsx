import React, { Component } from "react";

class DeleteFile extends Component {
  render() {
    return (
      <li>
        <button type="button" onClick={this.props.handleOnDelete.bind(this)}>
          Delete
        </button>
        <label id="deleteLabel">{this.props.labelValue}</label>
      </li>
    );
  }
}

export default DeleteFile;
