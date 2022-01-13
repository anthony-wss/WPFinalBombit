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
import {sendData, getGameState, getInitState, getHasEnd, getScores } from "./Client";
const GameOver = ({setPage,score})=>{
    const [name, setName] = useState('');
    const HomePage = ()=>{
        setPage(1)
    }
    const saveData = async () => {
        const score =70;
        console.log(score);
        const {
          data: { message, Person },
        } = await axios.post('/postScore', {
          name,
          score,
        });
        console.log(message);
        console.log(Person);
    }
    return(
        <div>
{/* This is the page for game over.<br></br><br></br> */}
        <input type="text" onChange={(e)=>setName(e.target.value)} />
        <LoadingButton
        color="secondary"
        onClick={saveData}
        loadingPosition="start"
        startIcon={<SaveIcon />}
        variant="contained"
        size = "small"
      >
        Save
      </LoadingButton>
        <Col offset={10}><Button className = "button" type="primary"  shape="round" size = {'large'} onClick = {HomePage} Row = {5}>
            Back To Home Page
        </Button></Col>
        </div>
    )
}
export default GameOver