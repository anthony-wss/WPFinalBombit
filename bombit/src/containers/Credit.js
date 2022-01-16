import { Row, Col, Affix } from 'antd';
import 'antd/dist/antd.css';
import background from '../img/background.png';
import Button from "@mui/material/Button";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { purple, orange } from '@mui/material/colors';
import us from '../img/creditLine.png';
const Credit = ({credit, setCredit, setPage})=>{
	const theme = createTheme({
		palette: {
			primary: {
				// Purple and green play nicely together.
				main: '#ef6c00',
			},
			secondary: {
				// This is green.A700 as hex.
				main: '#11cb5f',
			},
		},
	});
	const previous = ()=>{
		setPage(1);
		setCredit(false);
	}
	return(
		<ThemeProvider theme={theme}>
			<Row justify="center">
				<div style={{
						display:credit? 'block':'none', 
						fontSize:30,
						height:"600px", 
						width:"1370px", 
						backgroundImage: `url(${background})` 
				}}>

					<Col offset={14}>
						<Affix offsetTop={305}>
							<Row justify="center">
								<img src={us} style={{height:"350px", width:"auto"}}></img>
								{/* B09902033 王秀軒<br></br>
								B09902040 洪郁凱<br></br>
								B09902110 李沅錡<br></br> */}
							</Row>

						</Affix>
					</Col>
				</div>
			
			</Row>
			<Row justify="center">
				<Button style={{display:credit? 'block':'none',}} className = "button" variant="contained" color="primary" onClick = {previous}>
					回到主選單
				</Button>
			</Row>
		</ThemeProvider>
	)
}
export default Credit