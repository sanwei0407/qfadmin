import React, { useState, useRef } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable from '@ant-design/pro-table';
import { Button, message, Popconfirm } from 'antd';

import ProForm, { ModalForm, ProFormText } from '@ant-design/pro-form';

import $api from '@/api';

function Order() {

  const [editBox, setEditBox] = useState(false); // 编辑弹窗的提示
  const [editId, setEditId] = useState(null); // 当前的修改id

  const tableRef = useRef(); // 创建一个转发  关联protable组件实例
  const editFormRef = useRef(); // 创建一个编辑表单的转发
  const addFormRef = useRef(); // 创建一个新建表单的转发

  //  表格的列定义
  const columns = [
    {
      title: '订单id',
      width: 80,
      dataIndex: '_id',
      hideInSearch: true,
    },
    {
      title: '航班编号',
      width: 150,
      dataIndex: 'flightNum',
    },
    {
      title: '联系人电话',
      width: 150,
      dataIndex: 'phone',
    },
    {
      title: '出发城市',
      width: 150,
      dataIndex: 'startCity',
    },
    {
      title: '到达城市',
      dataIndex: 'arriveCity',
      hideInSearch: true,
      width: 150,
    },
    {
      title: '出发站点',
      dataIndex: 'startStationId',
      hideInSearch: true,
      width: 150,
    },
    {
      title: '到达站点',
      dataIndex: 'arriveStationId',
      hideInSearch: true,
      width: 150,
    },
    {
      title: '出发日期',
      dataIndex: 'orderDate',
      hideInSearch: true,
      width: 150,
    },
    {
      title:"订单状态",
      dataIndex:'orderState',
      width: 200,
      render(_,record ){
                      // 1 已下单未支付 2 已支付待确认 3 已确认 待核销 4 用户已乘车 5 用户未乘车单已过期 6 用户退票申请中 7用户退票成功 8 用户退票失败 9 取消
            if(record.orderState == 1) return '已下单未支付'
            if(record.orderState == 2) return '已支付待确认'
            if(record.orderState == 3) return '已确认待核销'
            if(record.orderState == 4) return '用户已乘车'
            if(record.orderState == 5) return '用户未乘车单已过期'
            if(record.orderState == 6) return '用户退票申请中'
            if(record.orderState == 7) return '用户退票成功'
            if(record.orderState == 8) return '用户退票失败'
            if(record.orderState == 9) return '取消'
      }
    },
  
    {
      title: '操作',
      hideInSearch: true,
      render(_, record) {
        return (
          <>
           
            { true &&  (
                <Popconfirm
                  title="是否确认该订单"
                  okText="Yes"
                  cancelText="No"
                  onConfirm={() => handleCheck(record._id)}
                >
                  <Button>   确认订单 </Button>
                </Popconfirm>
            )
            } 
         
          </>
        );
      },
    },
  ];

  // 获取表格数据的函数
  const getTableData = async (params) => {
    const { pageSize, current, ...postData } = params;

    //  params 会把当前的protable中需要的参数都集合给我们
    let _res = await $api.post('/order/getAll', {
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
  const handleCheck = async (id) => {
    const _res = await $api.post('/order/changeOrder', { orderId:id,state:3 });
    const { success } = _res.data;
    if (!success) message.error('修改成功');
    if (success) {
      tableRef.current.reload();
      message.success('修改失败');
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

export default Order;
