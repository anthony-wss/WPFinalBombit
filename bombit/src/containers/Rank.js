import React from 'react';
import ReactDOM from 'react-dom';
import zhCN from 'antd/lib/locale/zh_CN';
import "moment/locale/zh-cn";
import moment from "moment";
import 'antd/dist/antd.css';
import { List, Avatar } from 'antd';
moment.locale('zh-cn');
const Rank = ({rank, setRank, setPage})=>{
    const data = [
        {
          name: '李沅錡',
          score:100,
        },
        {
          name: '涂宇杰',
          score:100,
        },
        {
          name: '王秀軒',
          score:100,
        },
        {
          name: '洪郁凱',
          score:100,
        },
      ];
    const previous = ()=>{
        setPage(1);
        setRank(false);
    }
    return(
        <>
        <List style={{display:rank? 'block':'none' }}
        itemLayout="horizontal"
        dataSource={data}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              avatar={<Avatar src="https://joeschmoe.io/api/v1/random" />}
              title={<a href="https://ant.design">{item.name}</a>}
              description={item.score}
            />
          </List.Item>
        )}
      />,
        <div style={{display:rank? 'block':'none' }}>
            This page is for Rank.
            
            <button onClick={previous}>prev</button>
        </div>
        </>
    )
}
export default Rank