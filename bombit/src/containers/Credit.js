import { Button } from 'antd';
import { Row, Col } from 'antd';
import 'antd/dist/antd.css';
const Credit = ({credit, setCredit, setPage})=>{
    const previous = ()=>{
        setPage(1);
        setCredit(false);
    }
    return(
        <div style={{display:credit? 'block':'none' , fontSize:30}}>
            <Row justify="center">
            B09902033 王秀軒<br></br>
            B09902040 洪郁凱<br></br>
            B09902110 李沅錡
            </Row>
            <Row justify="center"><Button className = "button" type="primary"  shape="round" size = {'large'} onClick = {previous}>回到主選單</Button>
            </Row>
        </div>
    )
}
export default Credit