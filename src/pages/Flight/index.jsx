import React, { useState, useRef ,useEffect} from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable from '@ant-design/pro-table';
import { Button, message, Popconfirm } from 'antd';

import ProForm, { ModalForm, ProFormText ,ProFormSelect,ProFormTimePicker} from '@ant-design/pro-form';

import $api from '@/api';

function Station() {
  const [showAddBox, setShowAddBox] = useState(false); // 添加弹窗是否显示
  const [editBox, setEditBox] = useState(false); // 编辑弹窗的提示
  const [editId, setEditId] = useState(null); // 当前的修改id
  const [sts , setSts] = useState({}) // 起点站点的枚举
  const [ets , setEts] = useState({}) // 到达站点的枚举

  const [scity,setScity] = useState('') // 起点城市
  const [ecity,setEcity] = useState('') // 到达城市
  const tableRef = useRef(); // 创建一个转发  关联protable组件实例
  const editFormRef = useRef(); // 创建一个编辑表单的转发
  const addFormRef = useRef(); // 创建一个新建表单的转发

  //  表格的列定义
  const columns = [
    {
      title: '线路编号  ',
      width: 80,
      dataIndex: 'flightNum',
      hideInSearch: true,
    },
    {
      title: '起点城市',
      width: 150,
      dataIndex: 'startCity',
    },
    {
      title: '到达城市',
      width: 150,
      dataIndex: 'arriveCity',
    },
    {
      title: '票价',
      hideInSearch: true,
      render(_, record) {
        return record.ticketPrice / 100;
      },
    },
    {
      title: '最大的售票数量',
      dataIndex: 'maxNum',
      hideInSearch: true,
    },
    {
      title: '预售天数',
      dataIndex: 'preDay',
      hideInSearch: true,
    },
    {
      title: '操作',
      hideInSearch: true,
      render(_, record) {
        return (
          <>
            <Button
              onClick={ async () => {
                setEditId(record._id); // 设置一个当前的修改 记录的id
                await getStations(record.startCity,'s')
                await getStations(record.arriveCity,'e')
               
               editFormRef.current.setFieldsValue({
                  ...record,
                  ticketPrice: record.ticketPrice /100
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
    let _res = await $api.post('/flight/admin/getAll', {
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
    // 删除航线
    const _res = await $api.post('/flight/del', { id });
    const { success } = _res.data;
    if (!success) message.error('删除败');
    if (success) {
      tableRef.current.reload();
      message.success('删除成功');
    }
  };

  useEffect(()=>{
    if(scity)   getStations(scity,'s')
  },[scity])

  useEffect(()=>{
    if(ecity)   getStations(ecity,'e')
  },[ecity])


  // 根据城市名称获取它对应的站点
  const getStations = async (cityName,type)=>{
    console.log('name',name)
    let res = await $api.post('/station/getAll',{cityName})
    const { data } = res.data;
    const _temobj = {}
    
    data.forEach(element => {
          _temobj[element.stationName] = element.stationName
    });

    // 设置起点站点可选的内容
    if(type=='s'){
            setSts(_temobj)
    }
    if(type=='e'){
           setEts(_temobj)
    }
  }

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

          let _res = await $api.post('/flight/add', {
            ...data,
            ticketPrice: data.ticketPrice*100 // 价格精确到分
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
            name="flightNum"
            label="航班编号"
            tooltip="最长为 10 位"
            placeholder="请输入名称"
          />
              <ProFormText   width="md"  name="preDay"  label="预售天数" placeholder="预售天数" />
        </ProForm.Group>

       <ProForm.Group>
          <ProFormText   width="md"  name="ticketPrice"  label="票价" placeholder="价格" />
          <ProFormText   width="md"  name="maxNum"  label="最大可售票数" placeholder="最大可售票数" />
        </ProForm.Group>

        <ProForm.Group>
          <ProFormTimePicker   width="md"  name="startTime"  label="发车时间" placeholder="出发时间" />
        
        </ProForm.Group>


        <ProForm.Group>
          <ProFormText   width="md"  name="startCity"  label="出发城市" placeholder="请填写出发城市"  onChange={ev=>  setScity(ev.target.value)   }/>
          <ProFormText   width="md"  name="arriveCity"  label="到达城市" placeholder="请填写到达城市"  onChange={ev=>  setEcity(ev.target.value)   } />
        </ProForm.Group>

        <ProForm.Group>
           <ProFormSelect fieldProps={{mode:'tags'}}   label="出发站点" name="startStations" valueEnum={ sts  } /> 
          <ProFormSelect  fieldProps={{mode:'tags'}}   label="到达站点" name="arriveStations" valueEnum={ ets  } /> 
          
        </ProForm.Group>
        

      
      </ModalForm>

      {/* 修改 操作 */}
      <ModalForm
        formRef={editFormRef}
        visible={editBox}
        onVisibleChange={setEditBox}
        onFinish={async (data) => {
          // onFinish 函数就会得到用户填写的表单的内容 执行添加请求

          let _res = await $api.post('/flight/edit', {
            ...data,
            id: editId,
             ticketPrice: data.ticketPrice*100 // 价格精确到分
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
            name="flightNum"
            label="航班编号"
            tooltip="最长为 10 位"
            placeholder="请输入名称"
          />
              <ProFormText   width="md"  name="preDay"  label="预售天数" placeholder="预售天数" />
        </ProForm.Group>


        <ProForm.Group>
          <ProFormTimePicker   width="md"  name="startTime"  label="发车时间" placeholder="出发时间" />
        
        </ProForm.Group>

        <ProForm.Group>
          <ProFormText   width="md"  name="startCity"  label="出发城市" placeholder="请填写出发城市"  onChange={ev=>  setScity(ev.target.value)   }/>
          <ProFormText   width="md"  name="arriveCity"  label="到达城市" placeholder="请填写到达城市"  onChange={ev=>  setEcity(ev.target.value)   } />
        </ProForm.Group>

       <ProForm.Group>
          <ProFormText   width="md"  name="ticketPrice"  label="票价" placeholder="价格" />
          <ProFormText   width="md"  name="maxNum"  label="最大可售票数" placeholder="最大可售票数" />
        </ProForm.Group>

        <ProForm.Group>
           <ProFormSelect fieldProps={{mode:'tags'}}   label="出发站点" name="startStations" valueEnum={ sts  } /> 
          <ProFormSelect  fieldProps={{mode:'tags'}}   label="到达站点" name="arriveStations" valueEnum={ ets  } /> 
          
        </ProForm.Group>
        
        
      </ModalForm>
    </PageContainer>
  );
}

export default Station;
