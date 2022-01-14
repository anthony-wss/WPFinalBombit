import { Button } from 'antd';
import { Row, Col } from 'antd';
import 'antd/dist/antd.css';
const Tutorial = ({tutorial, setTutorial, setPage})=>{
    const previous = ()=>{
        setPage(1);
        setTutorial(false);
    }
    return(
        <div style={{display:tutorial? 'block':'none' }}>
            This page is for Tutorial.
            <Col offset={10}><Button className = "button" type="primary"  shape="round" size = {'large'} onClick = {previous}>回到主選單</Button>
            </Col>
        </div>
    )
}
export default Tutorial