import React, {useState} from 'react';
import AuthService from './AuthService';
import {
    Box,
    Button,
    Toolbar,
    Typography,
    TextField,
    AppBar,
    MenuItem,
    Container,
    IconButton,
    Menu,
    Paper
} from "@mui/material";
import {Menu as MenuIcon} from '@mui/icons-material';
import Products from 'products/Products';
import ShoppingCart from 'shoppingCart/ShoppingCart';

function NavigationBar() {

    const [username, setUsername] = useState<string>('');
    const [menuValue, setMenuValue] = useState<string>('Home');
    const [password, setPassword] = useState<string>('');
    const [userIsLoggedIn, setUserIsLoggedIn] = useState<boolean>(AuthService.getUsername().length > 3);

    const pages = ['Home', 'Products', 'ShoppingCart'];
    const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
    const API_URL = "http://localhost:3001";

    function handleLogin() {
        if (username.trim() === '' || password.trim() === '') {
            alert("Please provide a non-empty username and password.");
            return;
        }

        const credentials = {username, password};

        fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        })
            .then(response => {
                if (!response.ok) throw response;
                return response.json();
            })
            .then(response => {
                const jwt = response.jwt;
                console.log(`User ${username} is logged in with '${jwt}'`);
                AuthService.setLoggedUser(username, jwt);
                setUserIsLoggedIn(true);
            })
            .catch(error => {
                console.error(error);
                alert("Something went wrong :(");
            });
    }

    function handleLogout() {
        AuthService.setLoggedUser('', '');
        setUserIsLoggedIn(false);
    }


    const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElNav(event.currentTarget);
    };

    const handleCloseNavMenu = (page) => {

        setMenuValue(page)
        setAnchorElNav(null);
    };
    return (
        <>
            <AppBar position="static">
                <Container maxWidth="xl">
                    <Toolbar disableGutters>
                        <Box sx={{width: 500}}>
                            <IconButton
                                size="large"
                                aria-label="account of current user"
                                aria-controls="menu-appbar"
                                aria-haspopup="true"
                                onClick={handleOpenNavMenu}
                                color="inherit"
                            >
                                <MenuIcon/>
                            </IconButton>
                            <Menu
                                defaultChecked
                                id="menu-appbar"
                                anchorEl={anchorElNav}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'left',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'left',
                                }}
                                open={Boolean(anchorElNav)}
                                onClose={handleCloseNavMenu}
                            >
                                {pages.map((page) => (
                                    <MenuItem key={page} onClick={_ => handleCloseNavMenu(page)}>
                                        <Typography textAlign="left">{page}</Typography>
                                    </MenuItem>
                                ))}
                            </Menu>
                            <Typography variant="h6" component="span">
                                {menuValue}
                            </Typography>
                        </Box>
                        <Typography variant="h5" component="div" sx={{flexGrow: 1}}>
                            Not Emag 😊
                        </Typography>
                        <Box>
                            {
                                !userIsLoggedIn
                                    ?
                                    <div>
                                        <TextField sx={{width: 150}} size={"small"} type={"text"}
                                                   value={username}
                                                   required
                                                   id="outlined-required"

                                                   variant={"outlined"}
                                                   label="Username"
                                                   onChange={e => setUsername(e.target.value)}/>
                                        <TextField sx={{marginLeft: 1, width: 150}}
                                                   required
                                                   id="outlined-required"
                                                   variant={"outlined"}
                                                   label="Password"
                                                   size={"small"}
                                                   type={"password"}
                                                   value={password}
                                                   onChange={e => setPassword(e.target.value)}/>
                                        <Button sx={{marginLeft: 2,}} variant={"contained"} color="info"
                                                onClick={handleLogin}>Login</Button>
                                    </div>
                                    :
                                    <Button color="error" variant={"contained"} onClick={handleLogout}>Logout</Button>
                            }
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>
            {userIsLoggedIn && <Paper
                sx={{
                    marginUp: 2,
                    width: 1151,
                    height: 600
                }}
                elevation={3}
            >
                {menuValue === "Home" && <Typography variant="h2" component="div" sx={{flexGrow: 1}}
                >
                    Welcome, {AuthService.getUsername()}!
                </Typography>}
                {menuValue === "Products" &&
                    <Products jwtToken={AuthService.getJwt()} username={AuthService.getUsername()}/>}
                {menuValue === "ShoppingCart" &&
                    <ShoppingCart jwtToken={AuthService.getJwt()} username={AuthService.getUsername()}/>}
            </Paper>
            }
        </>
    );
}

export default NavigationBar;

