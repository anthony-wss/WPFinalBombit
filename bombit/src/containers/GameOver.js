import React from 'react';
import { useState } from 'react'
import { Affix, Row, Col} from 'antd';
import TextField from '@mui/material/TextField';
import 'antd/dist/antd.css';
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';
import SaveIcon from '@mui/icons-material/Save';
import axios from "../api"
import {sendData, getGameState, getInitState, getHasEnd, getScores, getPlayerCnt } from "./Client";
import { getPlayerId } from './Game';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { purple, blue, orange, } from '@mui/material/colors';
import background from '../img/background.png';

const GameOver = ({setPage})=>{
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
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const HomePage = ()=>{
      setPage(1)
  }
  const scoreArray = getScores();
  const score = scoreArray[getPlayerId()];
  const saveData = async () => {
    if (name==='') alert('名字不能為空');
    else if (password==='') alert('密碼不能為空');
    else 
    {
      console.log(name, password, score);
      const {
        data: { message, Person },
      } = await axios.post('/postScore', {
        name,
        password,
        score,
      });
      setName('')
      setPassword('')
      console.log(message);
      console.log(Person);
      HomePage();
    }
  }
  console.log(name);
  return(
    
    <ThemeProvider theme={theme}>
      <Row justify="center">
        <div style={{
          height: '600px',
          width: '1370px',
          backgroundImage: `url(${background})`,
          justifyContent: 'center',
        }}>   
          <Col offset={14}>
            <Affix offsetTop={315}>
              <Row justify="center"><div style = {{fontSize:40}}>{`你的成績: ${score}`}</div>
              </Row> 
            </Affix> 
            <Affix offsetTop={385}>
              <Row justify="center">
                  <TextField id="filled-basic" size = "small" placeholder="請輸入你的名字" variant="filled" onChange={(e)=>setName(e.target.value)} />
              </Row>    
            </Affix>
            <Affix offsetTop={433}>
              <Row justify="center">
                <TextField id="filled-basic" size = "small" placeholder="請輸入你的密碼" variant="filled" onChange={(e)=>setPassword(e.target.value)} />
              </Row>
            </Affix>
            
            <Affix offsetTop={505}>
              <Row justify="center">
                <LoadingButton
                  onClick={saveData}
                  endIcon={<SaveIcon />}
                  loadingPosition="end"
                  variant="contained"
                  color = "primary"
                >
                  儲存成績
                </LoadingButton>  
              </Row>
            </Affix>
          </Col>
        </div>
      </Row>
      <Row justify="center">
        <Button className = "button" variant="contained" color="primary" onClick = {HomePage}>
          回到主選單
        </Button>
      </Row>
    </ThemeProvider>
  )
}
export default GameOver