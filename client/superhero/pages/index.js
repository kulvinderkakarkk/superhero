import React from 'react'
import { withAuthenticator } from "@aws-amplify/ui-react";
import Navbar from './Navbar'
import SuperheroList from './SuperheroList';

function pages({ signOut, user, renderedAt }) {
    return (
        <>
        <Navbar 
            signOut={signOut}
            user={user}
        />
        <SuperheroList />
        </>
    )
}

export default withAuthenticator(pages)