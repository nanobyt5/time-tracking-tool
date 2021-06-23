import React, {useContext, useEffect, useRef, useState} from "react";
import {DualAxes} from "@ant-design/charts";
import {Form, Input, Table} from "antd";

const EditableContext = React.createContext(null);

const EditableRow = ({ index, ...props }) => {
    const [form] = Form.useForm();

    return (
        <Form form={form} component={false}>
            <EditableContext.Provider value={form}>
                <tr {...props} />
            </EditableContext.Provider>
        </Form>
    )
};

const EditableCell = ({
    title,
    editable,
    children,
    dataIndex,
    record,
    handleSave,
    ...restProps
}) => {
    const [editing, setEditing] = useState(false);
    const inputRef = useRef(null);
    const form = useContext(EditableContext);

    useEffect(() => {
        if (editing) {
            inputRef.current.focus();
        }
    }, [editing]);

    const toggleEdit = () => {
        setEditing(!editing);
        form.setFieldsValue({
            [dataIndex]: record[dataIndex]
        })
    }

    const save = async () => {
        try {
            const values = await form.validateFields();
            toggleEdit();
            handleSave({ ...record, ...values });
        } catch (errInfo) {
            console.log('Save failed:', errInfo);
        }
    }

    let childNode = children;

    if (editable) {
        childNode = editing ? (
            <Form.Item
                style={{
                    margin: 0,
                }}
                name={dataIndex}
                rules={[
                    {
                        required: true,
                        message: `${title} is required.`,
                    },
                ]}
            >
                <Input ref={inputRef} onPressEnter={save} onBlur={save} />
            </Form.Item>
        ) : (
            <div
                className="editable-cell-value-wrap"
                style={{
                    paddingRight: 24,
                }}
                onClick={toggleEdit}
            >
                {children}
            </div>
        );
    }

    return <td {...restProps}>{childNode}</td>
}

const COLUMNS = [
    {
        title: 'Sprint',
        dataIndex: 'sprint',
    },
    {
        title: 'Capacity',
        dataIndex: 'capacity',
        editable: true
    },
    {
        title: 'Completed',
        dataIndex: 'completed',
        editable: true
    },
    {
        title: 'Velocity',
        dataIndex: 'velocity',
    }
];

function SprintVelocityChart(props) {
    const [barData, setBarData] = useState(props.barData);
    const [lineData, setLineData] = useState(props.lineData);
    const [tableData, setTableData] = useState(props.tableData);
    // const [data, setData] = useState(props.data);

    // let barData = [];
    // let lineData = [];
    // let tableData = [];
    // const populateData = (lookUp, sprints) => {
    //     let i = 0;
    //     sprints.forEach(sprint => {
    //         let currSprint = lookUp[sprint];
    //         let hours = currSprint["hours"];
    //         let storyPoints = currSprint["storyPoints"];
    //         let velocity = storyPoints / (hours / 8);
    //
    //         barData.push(
    //             {
    //                 sprint: sprint,
    //                 value: hours,
    //                 type: 'Time Spent'
    //             },
    //             {
    //                 sprint: sprint,
    //                 value: storyPoints,
    //                 type: 'Total Story Points'
    //             })
    //
    //         lineData.push({
    //             sprint: sprint,
    //             velocity: velocity
    //         })
    //
    //         tableData.push(
    //             {
    //                 key: i++,
    //                 sprint: sprint,
    //                 capacity: hours,
    //                 completed: storyPoints,
    //                 velocity: velocity
    //             }
    //         )
    //     })
    // }
    //
    // const getChartData = () => {
    //     let lookUp = {};
    //     let sprints = [];
    //
    //     data.filter(entry => entry["Team"] === "Tech Team" && entry["Story Points Completed"] !== "")
    //         .forEach(entry => {
    //             let sprint = entry["Sprint Cycle"];
    //             let hours = parseFloat(entry["Hours"]);
    //             let storyPoints = parseFloat(entry["Story Points Completed"]);
    //
    //             if (!(sprint in lookUp)) {
    //                 lookUp[sprint] = {
    //                     hours: hours,
    //                     storyPoints: storyPoints
    //                 };
    //                 sprints.push(sprint);
    //             } else {
    //                 let currEntry = lookUp[sprint];
    //                 currEntry["hours"] += hours;
    //                 currEntry["storyPoints"] += storyPoints;
    //                 lookUp[sprint] = currEntry;
    //             }
    //         })
    //
    //     sprints.sort();
    //
    //     populateData(lookUp, sprints);
    // }

    const handleSave = (row) => {
        console.log("save", row)
        const newData = [...tableData];
        const index = newData.findIndex(item => row.key === item.key);
        const item = newData[index];
        newData.splice(index, 1, { ...item, ...row });
        console.log("new data", newData);
        setTableData(newData);
    }

    // getChartData();

    const components = {
        body: {
            row: EditableRow,
            cell: EditableCell,
        },
    };

    const columns = COLUMNS.map(col => {
        if (!col.editable) {
            return col;
        }

        return {
            ...col,
            onCell: (record) => ({
                record,
                editable: col.editable,
                dataIndex: col.dataIndex,
                title: col.title,
                handleSave: handleSave,
            }),
        };
    })

    let config = {
        data: [barData, lineData],
        xField: 'sprint',
        yField: ['value', 'velocity'],
        geometryOptions: [
            {
                geometry: 'column',
                isGroup: true,
                seriesField: 'type',
            },
            {
                geometry: 'line',
                lineStyle: { lineWidth: 2 },
                isStack: true
            },
        ],
    };

    const titleComponent = () => (
      <div style={{ margin:"5px", display:"flex", justifyContent:"space-between", width:"700px" }}>
          <h2>Sprint Velocity</h2>
      </div>
    );


    const dataGridComponent = () => (
        <div style={{ width:"39%", padding:"11px" }} >
            <Table
                components={components}
                rowClassName={() => 'editable-row'}
                bordered
                dataSource={tableData}
                columns={columns}
            />
        </div>
    );

    const multiAxesComponent = () => (
        <div className="chart" style={{ width:"60%", height:"500px" }}>
            <DualAxes
                {...config}
            />
        </div>
    );

    return (
        <div>
            {titleComponent()}
            <div style={{ display:"flex", justifyContent:"space-evenly", margin:"5px" }}>
                {dataGridComponent()}
                {multiAxesComponent()}
            </div>
        </div>
    )
}

export default SprintVelocityChart;