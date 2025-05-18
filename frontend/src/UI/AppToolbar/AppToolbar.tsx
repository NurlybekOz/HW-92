import {AppBar, Container, Grid, styled, Toolbar, Typography} from "@mui/material";
import {NavLink} from "react-router-dom";
import AnonymousMenu from "./AnonymousMenu.tsx";
import UserMenu from "./UserMenu.tsx";
import {useAppSelector} from "../../app/hooks.ts";
import {selectUser} from "../../features/users/usersSlice.ts";

const Link = styled(NavLink)({
    color: 'inherit',
    textDecoration: 'none',
    '&:hover': {
        color: 'inherit'
    },
});

const AppToolbar = () => {
    const user = useAppSelector(selectUser);

    return (
        <AppBar position="sticky" color='error' sx={{mb: 2}}>
            <Toolbar>
                <Container maxWidth="xl">
                    <Grid container spacing={2} justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
                            <Link to="/">Chat</Link>
                        </Typography>
                        {user ?
                            (<UserMenu user={user}/>)
                            :
                            (<AnonymousMenu/>)
                        }
                    </Grid>
                </Container>
            </Toolbar>
        </AppBar>
    );
};


export default AppToolbar;