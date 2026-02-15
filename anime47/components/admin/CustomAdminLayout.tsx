"use client";

import React, { useState } from "react";
import { useMenu, useGo } from "@refinedev/core";
import { Layout, Menu, Grid, theme, Typography, Space, Button } from "antd";
import {
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    LogoutOutlined
} from "@ant-design/icons";
import { useSession, signOut } from "next-auth/react";

const { Header, Sider, Content } = Layout;
const { useToken } = theme;

export const CustomAdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { token } = useToken();
    const [collapsed, setCollapsed] = useState(false);
    const { menuItems, selectedKey } = useMenu();
    const go = useGo();
    const breakpoint = Grid.useBreakpoint();
    const { data: session } = useSession();

    // Handle Logout
    const handleLogout = async () => {
        await signOut({ callbackUrl: "/admin/login" });
    };

    const menuItemsList = [
        ...menuItems.map((item) => ({
            key: item.key,
            icon: item.icon,
            label: item.label,
            onClick: () => {
                go({ to: item.route ?? "/" });
            },
        })),
        // Add explicit Logout button at the bottom
        {
            key: "logout",
            icon: <LogoutOutlined />,
            label: "Logout",
            danger: true,
            onClick: handleLogout
        }
    ];

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                breakpoint="lg"
                onBreakpoint={(broken) => {
                    if (broken) setCollapsed(true);
                }}
                style={{
                    background: token.colorBgContainer,
                    borderRight: `1px solid ${token.colorBorderSecondary}`
                }}
                theme="light"
            >
                <div style={{
                    height: 64,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    borderBottom: `1px solid ${token.colorBorderSecondary}`
                }}>
                    <Typography.Title level={4} style={{ margin: 0, color: token.colorPrimary, whiteSpace: "nowrap" }}>
                        {collapsed ? "A47" : "Anime47 Admin"}
                    </Typography.Title>
                </div>
                <Menu
                    mode="inline"
                    selectedKeys={[selectedKey]}
                    items={menuItemsList}
                    style={{ borderRight: 0, marginTop: 10 }}
                />
            </Sider>
            <Layout>
                <Header style={{
                    padding: "0 24px",
                    background: token.colorBgContainer,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderBottom: `1px solid ${token.colorBorderSecondary}`
                }}>
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{
                            fontSize: '16px',
                            width: 64,
                            height: 64,
                        }}
                    />

                    <Space>
                        <Typography.Text strong>{session?.user?.name || "Admin"}</Typography.Text>
                    </Space>
                </Header>
                <Content style={{
                    margin: "24px 16px",
                    padding: 24,
                    minHeight: 280,
                    background: "transparent" // Let children handle their own background or use transparent
                }}>
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
};
