import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import 'antd/dist/antd.css';
import { Layout, Menu, Breadcrumb } from 'antd';
import App from './containers/App';
const { Header, Content, Footer } = Layout;

ReactDOM.render(
  <Layout className="layout">
  <Header>
    <div className="logo" />
    <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['1']}>
      {new Array(1).fill(null).map((_, index) => {
        const key = index + 1;
        return <Menu.Item key={key}>爆爆王</Menu.Item>;
      })}
    </Menu>
  </Header>
  <Content style={{ padding: '0 50px' }}>
    <Breadcrumb style={{ margin: '16px 0' }}>
      <Breadcrumb.Item></Breadcrumb.Item>
      {/* <Breadcrumb.Item>List</Breadcrumb.Item>
      <Breadcrumb.Item>App</Breadcrumb.Item> */}
    </Breadcrumb>
    <div className="site-layout-content"><App /></div>
  </Content>
  <Footer style={{ textAlign: 'center' }}>Ant Design ©2018 Created by Ant UED</Footer>
</Layout>, 

  document.getElementById('root')
);

