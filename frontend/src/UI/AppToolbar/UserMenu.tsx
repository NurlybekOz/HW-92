import {Button, Grid} from "@mui/material";
import { User } from "../../types";
import {useAppDispatch} from "../../app/hooks.ts";
import {logout} from "../../features/users/usersThunk.ts";
import {unsetUser} from "../../features/users/usersSlice.ts";

interface Props {
    user: User;
}

const UserMenu: React.FC<Props> = ({user}) => {
    const dispatch = useAppDispatch();

    const handleLogout = async () => {
        await dispatch(logout());
        dispatch(unsetUser());
    }
    return (
            <Grid
                color="inherit"
                alignItems='center'
                fontSize='15px'
            >
                Hello, <b>{user.username}</b>! <Button sx={{textTransform: "none", padding: '3px 6px 5px 5px', textDecoration: 'underline'}} onClick={handleLogout} color='inherit'>Logout</Button>
            </Grid>
    );
};

export default UserMenu;