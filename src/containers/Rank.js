import React from 'react';
import { useState } from 'react'
import ReactDOM from 'react-dom';
import zhCN from 'antd/lib/locale/zh_CN';
import "moment/locale/zh-cn";
import moment from "moment";
import 'antd/dist/antd.css';
import { List, Avatar, Button } from 'antd';
import axios from '../api';
moment.locale('zh-cn');
const Rank = ({rank, setRank, setPage, queryRank, setQueryRank})=>{
    const [data, setData] = useState([

    ])
          



    const previous = ()=>{
        setPage(1);
        setRank(false);
    }
    const queryData = async () => {
        const {
          data: { message,Person },
        } = await axios.get('/allRank', {
        });
        setData([...data, ...Person]);
    }
    if (queryRank===1) 
    {
        queryData();
        setQueryRank(0);
    }
    return(
        <>
        <List style={{display:rank? 'block':'none' }}
        itemLayout="horizontal"
        dataSource={data}
        renderItem={(item) => (
          <List.Item>
              {/* {item.name}
              {item.score} */}
            <List.Item.Meta
              avatar={<Avatar src="https://joeschmoe.io/api/v1/random" />}
              title={<a href="https://ant.design">{item.name}</a>}
              description={`Score:${item.score}`}
            />
          </List.Item>
        )}
      />
        <div style={{display:rank? 'block':'none' }}>
            
        <Button className = "button" type="primary"  shape="round" size = {'large'} onClick = {previous}>
              回到主選單
        </Button>
        </div>
        </>
    )
}
export default Rank