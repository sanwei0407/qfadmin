import React, { useState, useRef } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable from '@ant-design/pro-table';
import { Button, message, Popconfirm } from 'antd';

import ProForm, { ModalForm, ProFormText } from '@ant-design/pro-form';

import $api from '@/api';

function Station() {
  const [showAddBox, setShowAddBox] = useState(false); // 添加弹窗是否显示
  const [editBox, setEditBox] = useState(false); // 编辑弹窗的提示
  const [editId, setEditId] = useState(null); // 当前的修改id

  const tableRef = useRef(); // 创建一个转发  关联protable组件实例
  const editFormRef = useRef(); // 创建一个编辑表单的转发
  const addFormRef = useRef(); // 创建一个新建表单的转发

  //  表格的列定义
  const columns = [
    {
      title: '站点id',
      width: 80,
      dataIndex: '_id',
      hideInSearch: true,
    },
    {
      title: '站点名称',
      width: 150,
      dataIndex: 'stationName',
    },
    {
      title: '归属城市',
      width: 150,
      dataIndex: 'cityName',
    },
    {
      title: '站点地址',
      dataIndex: 'stationAdd',
      hideInSearch: true,
    },
    {
      title: 'gps坐标',
      dataIndex: 'stationGps',
      hideInSearch: true,
      render(_, record) {
        return record.stationGps.map((item, index) => <span key={index}> {item}</span>);
      },
    },
    {
      title: '操作',
      hideInSearch: true,
      render(_, record) {
        return (
          <>
            <Button
              onClick={() => {
                setEditId(record._id); // 设置一个当前的修改 记录的id
                editFormRef.current.setFieldsValue({
                  ...record,
                  stationGps: record.stationGps.join(),
                }); // 设置弹出的编辑表单的 表单默认值
                setEditBox(true);
              }}
            >
              修改
            </Button>

            <Popconfirm
              title="你确认删除该信息？"
              okText="Yes"
              cancelText="No"
              onConfirm={() => handleDelete(record._id)}
            >
              <Button> 删除 </Button>
            </Popconfirm>
          </>
        );
      },
    },
  ];

  // 获取表格数据的函数
  const getTableData = async (params) => {
    const { pageSize, current, ...postData } = params;

    //  params 会把当前的protable中需要的参数都集合给我们
    let _res = await $api.post('/station/getAll', {
      limit: pageSize,
      page: current,
      ...postData,
    });

    const { success, data, count } = _res.data;
    if (success) {
      // 在 getTableData当中一定要返回一个对象 这个对象就是表格需要渲染的数据的根源
      // data就是表格的数据
      // success 是表格判断是否加载数据成功的依据
      //  total 表格能实现分页的基础
      return {
        success,
        data,
        total: count,
      };
    }
  };

  // 执行删除
  const handleDelete = async (id) => {
    const _res = await $api.post('/station/del', { id });
    const { success } = _res.data;
    if (!success) message.error('删除败');
    if (success) {
      tableRef.current.reload();
      message.success('删除成功');
    }
  };

  return (
    <PageContainer>
      <ProTable
        actionRef={tableRef}
        columns={columns}
        request={getTableData}
        rowKey="_id"
        toolBarRender={() => (
          <Button type="primary" onClick={() => setShowAddBox(true)}>
            新建
          </Button>
        )}
      />

      {/* 添加 操作 */}
      <ModalForm
        formRef={addFormRef}
        visible={showAddBox}
        onVisibleChange={setShowAddBox}
        onFinish={async (data) => {
          // onFinish 函数就会得到用户填写的表单的内容 执行添加请求

          cosnole.log('data', data);
          let _res = await $api.post('/station/add', {
            ...data,
            stationGps: data.stationGps.split(','),
          });
          const { success } = _res.data;

          if (!success) message.error('添加失败');
          if (success) {
            tableRef.current.reload();
            message.success('添加成功');
          }
          addFormRef.current.resetFields(); // 重置表单
          return success;
        }}
      >
        <ProForm.Group>
          <ProFormText
            width="md"
            name="stationName"
            label="站点名称"
            tooltip="最长为 10 位"
            placeholder="请输入名称"
          />

          <ProFormText width="md" name="stationAdd" label="站点地址" placeholder="请输入站点地址" />
        </ProForm.Group>
        <ProForm.Group>
          <ProFormText
            width="md"
            name="cityName"
            label="城市"
            placeholder="请输入站点所在的城市名称"
          />

          <ProFormText width="md" name="stationGps" label="坐标" placeholder="gps坐标" />
        </ProForm.Group>
      </ModalForm>

      {/* 修改 操作 */}
      <ModalForm
        formRef={editFormRef}
        visible={editBox}
        onVisibleChange={setEditBox}
        onFinish={async (data) => {
          // onFinish 函数就会得到用户填写的表单的内容 执行添加请求

          let _res = await $api.post('/station/edit', {
            ...data,
            stationGps: data.stationGps.split(','),
            stationId: editId,
          });
          const { success } = _res.data;

          if (!success) message.error('编辑失败');
          if (success) {
            tableRef.current.reload();
            message.success('编辑成功');
          }
          editFormRef.current.resetFields(); // 重置表单
          return success;
        }}
      >
        <ProForm.Group>
          <ProFormText
            width="md"
            name="stationName"
            label="站点名称"
            tooltip="最长为 10 位"
            placeholder="请输入名称"
          />

          <ProFormText width="md" name="stationAdd" label="站点地址" placeholder="请输入站点地址" />
        </ProForm.Group>
        <ProForm.Group>
          <ProFormText
            width="md"
            name="cityName"
            label="城市"
            placeholder="请输入站点所在的城市名称"
          />

          <ProFormText width="md" name="stationGps" label="坐标" placeholder="gps坐标" />
        </ProForm.Group>
      </ModalForm>
    </PageContainer>
  );
}

export default Station;
