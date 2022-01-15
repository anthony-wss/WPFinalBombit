import React from 'react';
import { useState } from 'react'
import ReactDOM from 'react-dom';
import zhCN from 'antd/lib/locale/zh_CN';
import "moment/locale/zh-cn";
import moment from "moment";
import { Row, Col, List, Avatar, message, Skeleton, Divider, Menu, Dropdown } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import 'antd/dist/antd.css';
import axios from '../api';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import TextField from '@mui/material/TextField';
import background from '../img/background.png';
import InfiniteScroll from 'react-infinite-scroll-component';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { purple, orange, blue } from '@mui/material/colors';
moment.locale('zh-cn');

const Rank = ({rank, setRank, setPage, queryRank, setQueryRank})=>{
  const theme = createTheme({
    palette: {
      primary: {
        // Purple and green play nicely together.
        main: '#ef6c00',
      },
      secondary: {
        // This is green.A700 as hex.
        main: '#2962ff',
      },
    },
  });
  const [password, setPassword] = useState('');
  const [data, setData] = useState([])

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
      console.log(data)
  }
  return(
    <ThemeProvider theme={theme} >
      <Row justify="center">
        <div
          id="scrollableDiv"
          style={{
            display:rank? 'block':'none',
            height: 600,
            width:1370,
            overflow: 'auto',
            padding: '0 16px',
            border: '1px solid rgba(140, 140, 140, 0.35)',
            backgroundImage: `url(${background})`
          }}
        > 
          <InfiniteScroll
            dataLength={data.length}
            // next={queryData}
            // hasMore={data.length < 50}
            loader={<Skeleton avatar paragraph={{ rows: 1 }} active />}
            endMessage={<Divider plain>It is all, nothing more 🤐</Divider>}
            scrollableTarget="scrollableDiv"
          >
            <List
              dataSource={data}
              renderItem={item => (
              <List.Item key={item.id}>
                <List.Item.Meta
                avatar={<Avatar src="https://joeschmoe.io/api/v1/random" />}
                  title={<a>{item.score}</a>}
                  description={item.name}
              />
              
                <Dropdown overlay={
                  <Menu>
                    <Menu.Item icon={<DownOutlined />} disabled>
                      <TextField
                        id="standard-password-input"
                        label="請輸入正確密碼"
                        type="password"
                        autoComplete="current-password"
                        variant="standard" onChange={(e)=>setPassword(e.target.value)} 
                      />
                    </Menu.Item>
                    <Menu.Item>
                      <Button variant="outlined" startIcon={<DeleteIcon />} 
                        color="secondary"
                        onClick={async()=>{
                          console.log(password)
                          if (password==='') alert('密碼不能為空')
                          else 
                          {
                            console.log(item.name, item.score)
                            const {
                              data: { deleteMessage },
                            } = await axios.post('/deleteData', {
                              name: item.name,
                              password: password,
                              score: item.score,
                            });
                            console.log('success')
                            alert(deleteMessage);
                            previous();
                          }
                        }}
                      >
                        刪除
                      </Button>
                    </Menu.Item>
                  </Menu>}
                >
                  <a>
                    {`刪除分數 `}
                    <DownOutlined />
                  </a> 
                </Dropdown>
                
                </List.Item>
              )}
            />
          </InfiniteScroll> 
        </div>  
      </Row>
      
      <Row justify="center">
        <Button style={{display:rank? 'block':'none',}} className = "button" variant="contained" color="primary" onClick = {previous}>
            回到主選單
        </Button>
      </Row>
    </ThemeProvider>
  )
}
export default Rank