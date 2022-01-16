import { useState } from 'react'
import { Button } from 'antd';
import { Row, Col } from 'antd';
import 'antd/dist/antd.css';
import { Input } from 'antd';
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import SaveIcon from '@mui/icons-material/Save';
import SendIcon from '@mui/icons-material/Send';
import axios from "../api"
import {sendData, getGameState, getInitState, getHasEnd, getScores, getPlayerCnt, getPlayerId } from "./Client";
const GameOver = ({setPage})=>{
    const [name, setName] = useState('');
    const HomePage = ()=>{
        setPage(1)
    }
    const scoreArray = getScores();
    const score = scoreArray[getPlayerId()];
    const saveData = async () => {
        console.log(score);
        const {
          data: { message, Person },
        } = await axios.post('/postScore', {
          name,
          score,
        });
        console.log(message);
        console.log(Person);
        HomePage();
    }
    return(
        <div style = {{fontSize:40}}>
            <Row justify="center">
        <input type="text" placeholder="請輸入你的名字" onChange={(e)=>setName(e.target.value) } />
         <LoadingButton
        color="secondary"
        onClick={saveData}
        loadingPosition="start"
        startIcon={<SaveIcon />}
        variant="contained"
        size = "large"
      >
        Save
      </LoadingButton>       
        </Row>
        <Row justify="center"><div style = {{fontSize:50}}>{`你的成績: ${score}`}</div>
        </Row>    

        <Row justify="center"><Button className = "button" type="primary"  shape="round" size = {'large'} onClick = {HomePage} Row = {5}>
            回到主選單
        </Button></Row>
        </div>
    )
}
export default GameOver