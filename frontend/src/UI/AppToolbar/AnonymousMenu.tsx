import {Button} from "@mui/material";
import {NavLink} from "react-router-dom";

const AnonymousMenu = () => {
    return (
        <>
            <Button component={NavLink} to='/register' color="inherit">Register</Button>
            <Button component={NavLink} to='/login' color="inherit">Login</Button>
        </>
    );
};

export default AnonymousMenu;