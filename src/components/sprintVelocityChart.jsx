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

    const saveNewBarData = (key, sprint, capacity, completed) => {
        const newBarData = [...barData];
        const timeIndex = newBarData.findIndex(item => key + '.1' === item.key);

        const timeItem = newBarData[timeIndex];
        const newTimeItem = {
            key: key + '.1',
            sprint: sprint,
            value: capacity,
            type: 'Time Spent'
        };

        newBarData.splice(timeIndex, 1, { ...timeItem, ...newTimeItem });

        const storyIndex = newBarData.findIndex(item => key + '.2' === item.key);

        const storyItem = newBarData[storyIndex];
        const newStoryItem = {
            key: key + '.2',
            sprint: sprint,
            value: completed,
            type: 'Total Story Points'
        };

        newBarData.splice(storyIndex, 1, { ...storyItem, ...newStoryItem });

        setBarData(newBarData);
    }

    const saveNewLineData = (key, sprint, velocity) => {
        const newLineData = [...lineData];
        const index = newLineData.findIndex(item => key === item.key);

        const item = newLineData[index];
        const newItem = {
            key: key,
            sprint: sprint,
            velocity: velocity
        };

        newLineData.splice(index, 1, { ...item, ...newItem });

        setLineData(newLineData);
    }

    const saveNewTableData = (key, sprint, capacity, completed, velocity) => {
        const newTableData = [...tableData];
        const index = newTableData.findIndex(item => key === item.key);

        const item = newTableData[index];
        const newItem = {
            key: key,
            sprint: sprint,
            capacity: capacity,
            completed: completed,
            velocity: velocity
        };

        newTableData.splice(index, 1, {...item, ...newItem});

        setTableData(newTableData);
    }

    const handleSave = ({ key, sprint, capacity, completed }) => {
        let capacityParse = parseFloat(capacity);
        let completedParse = parseFloat(completed);
        let velocity = completedParse / (capacityParse / 8);

        saveNewTableData(key, sprint, capacityParse, completedParse, velocity);
        saveNewBarData(key, sprint, capacityParse, completedParse);
        saveNewLineData(key, sprint, velocity);
    }

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


    const tableComponent = () => (
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
                {tableComponent()}
                {multiAxesComponent()}
            </div>
        </div>
    )
}

export default SprintVelocityChart;