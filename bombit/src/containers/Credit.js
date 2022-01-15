import { Row, Col, Affix } from 'antd';
import 'antd/dist/antd.css';
import background from '../img/background.png';
import Button from "@mui/material/Button";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { purple, orange } from '@mui/material/colors';
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

					<Col offset={15}>
						<Affix offsetTop={385}>
							<Row justify="center">
								B09902033 王秀軒<br></br>
								B09902040 洪郁凱<br></br>
								B09902110 李沅錡<br></br>
							</Row>
							<Row justify="center">
								<Button className = "button" variant="contained" color="primary" onClick = {previous}>
									回到主選單
								</Button>
							</Row>

						</Affix>
					</Col>
				</div>
			</Row>
		</ThemeProvider>
	)
}
export default Credit